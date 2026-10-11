import asyncio
import random
from decimal import Decimal
from faker import Faker
from sqlalchemy.ext.asyncio import AsyncSession

from src.config import settings
from src.database import engine, async_session_maker, init_db
from src.modules.products.models import Product
from src.modules.orders.models import Customer, Order, OrderItem, OrderStatus, ChannelType

fake = Faker("es_MX")

CATEGORIES = [
    "Electrónica",
    "Ropa",
    "Hogar",
    "Deportes",
    "Belleza",
    "Juguetes",
    "Libros",
    "Alimentos",
]

PRODUCT_TEMPLATES = {
    "Electrónica": [
        ("Auriculares Bluetooth", "Auriculares inalámbricos con cancelación de ruido", 899, 1599),
        ("Cargador Rápido 65W", "Cargador GaN compacto para laptop y móvil", 349, 599),
        ("Smartwatch Serie 5", "Monitor de actividad, GPS, resistente al agua", 2499, 4999),
        ("Teclado Mecánico RGB", "Switches hot-swap, iluminación personalizable", 799, 1499),
        ("Mouse Gamer Inalámbrico", "Sensor 26K DPI, 70h batería", 599, 1199),
    ],
    "Ropa": [
        ("Camiseta Básica Algodón", "100% algodón orgánico, varios colores", 199, 349),
        ("Jeans Slim Fit", "Denim stretch, corte moderno", 599, 999),
        ("Sudadera con Capucha", "Interior afelpado, unisex", 449, 799),
        ("Chaqueta Impermeable", "Transpirable, costuras selladas", 899, 1599),
        ("Calcetines Deportivos (pack 5)", "Algodón transpirable, zona acolchada", 149, 249),
    ],
    "Hogar": [
        ("Set de Sartenes Antiadherentes", "3 piezas, aptas inducción", 699, 1299),
        ("Aspiradora Robot", "Navegación láser, app control", 2999, 5999),
        ("Juego de Sábanas 300 Hilos", "Algodón egipcio, 4 piezas", 599, 1099),
        ("Lámpara LED Inteligente", "RGB, control por voz/app", 299, 549),
        ("Organizador de Closet", "6 compartimentos, tela transpirable", 199, 349),
    ],
    "Deportes": [
        ("Esterilla Yoga Antideslizante", "TPE ecológico, 6mm grosor", 249, 449),
        ("Mancuernas Ajustables 20kg", "Sistema dial rápido, par", 1299, 2499),
        ("Bandas Elásticas Resistencia", "Set 5 niveles, incluye ancla puerta", 199, 349),
        ("Botella Térmica 1L", "Acero inoxidable, 24h frío/12h calor", 249, 449),
        ("Zapatillas Running", "Amortiguación reactiva, malla transpirable", 1199, 1999),
    ],
    "Belleza": [
        ("Serum Vitamina C 30ml", "Antioxidante, iluminador, todo tipo piel", 349, 649),
        ("Crema Hidratante Ácido Hialurónico", "50ml, día y noche", 299, 549),
        ("Set Brochas Maquillaje 10pcs", "Cerdas sintéticas, estuche incluido", 249, 449),
        ("Protector Solar FPS50+", "Toque seco, resistente agua", 249, 399),
        ("Aceite Corporal Seco 100ml", "Nutritivo, absorción rápida", 199, 349),
    ],
    "Juguetes": [
        ("LEGO Creator 3en1", "3 modelos en 1, 300+ piezas", 599, 999),
        ("Puzzle 1000 Piezas", "Paisaje artístico, cartón premium", 199, 349),
        ("Pelota Futbol Oficial T5", "FIFA Quality, caucho sintético", 299, 549),
        ("Juego de Mesa Estrategia", "2-4 jugadores, 60-90 min", 449, 799),
        ("Drone Mini HD", "Cámara 720p, 15min vuelo", 799, 1499),
    ],
    "Libros": [
        ("Hábitos Atómicos - James Clear", "Bestseller productividad", 299, 449),
        ("Psicología del Dinero - Morgan Housel", "Finanzas conductuales", 249, 399),
        ("Cien Años de Soledad - G.G. Márquez", "Clásico literatura latinoamericana", 199, 349),
        ("El Sutil Arte de Que Te Importe un Carajo", "Autoayuda moderna", 249, 399),
        ("Cocina Mexicana Contemporánea", "100 recetas ilustradas", 349, 549),
    ],
    "Alimentos": [
        ("Café Especial 500g", "Origen único, tueste medio", 199, 349),
        ("Chocolate Negro 70% Cacao", "Orgánico, comercio justo", 149, 249),
        ("Miel Orgánica 500g", "Cruda, sin filtrar", 179, 299),
        ("Aceite Oliva Virgen Extra 500ml", "Cosecha temprana, frutado", 249, 449),
        ("Snacks Saludables Variados (pack 10)", "Sin azúcar añadida, veganos", 299, 499),
    ],
}


async def seed_products(session: AsyncSession) -> list[Product]:
    products = []
    sku_counter = 1

    for category, templates in PRODUCT_TEMPLATES.items():
        for name, desc, min_price, max_price in templates:
            price = Decimal(str(random.randint(min_price, max_price)))
            stock = random.randint(5, 50)

            product = Product(
                sku=f"MN-{category[:3].upper()}-{sku_counter:04d}",
                name=name,
                description=desc,
                price=price,
                stock=stock,
                category=category,
                images=[f"https://picsum.photos/seed/{sku_counter}/400/400.jpg"],
                is_active=True,
                metadata={"tags": [category.lower(), "demo"]},
            )
            session.add(product)
            products.append(product)
            sku_counter += 1

    await session.flush()
    return products


async def seed_customers_and_orders(session: AsyncSession, products: list[Product]) -> None:
    channels = [ChannelType.WHATSAPP, ChannelType.FACEBOOK, ChannelType.WEB]
    statuses = [
        OrderStatus.DELIVERED,
        OrderStatus.SHIPPED,
        OrderStatus.PROCESSING,
        OrderStatus.CONFIRMED,
        OrderStatus.PENDING_PAYMENT,
    ]

    for _ in range(20):
        channel = random.choice(channels)
        external_id = f"{channel.value.lower()}_{fake.uuid4()[:8]}"

        customer = Customer(
            external_id=external_id,
            name=fake.name(),
            phone=f"+521{fake.msisdn()[3:13]}" if random.random() > 0.3 else None,
            email=fake.email() if random.random() > 0.5 else None,
            channel=channel,
            metadata={"source": "demo_seed"},
        )
        session.add(customer)
        await session.flush()

        num_orders = random.randint(1, 3)
        for _ in range(num_orders):
            num_items = random.randint(1, 4)
            selected_products = random.sample(products, min(num_items, len(products)))

            items = []
            total = Decimal("0")
            for p in selected_products:
                qty = random.randint(1, 3)
                items.append({
                    "product_id": p.id,
                    "quantity": qty,
                    "unit_price": p.price,
                    "total_price": p.price * qty,
                })
                total += items[-1]["total_price"]

            order = Order(
                order_number=f"MN-{fake.date_this_year().strftime('%Y%m%d')}-{fake.random_number(digits=4, fix_len=True)}",
                status=random.choice(statuses),
                channel=channel,
                customer_id=customer.id,
                total=total,
                metadata={"demo": True},
            )
            session.add(order)
            await session.flush()

            for item_data in items:
                order_item = OrderItem(order_id=order.id, **item_data)
                session.add(order_item)


async def main():
    print("Initializing database...")
    await init_db()

    async with async_session_maker() as session:
        print("Seeding products...")
        products = await seed_products(session)

        print("Seeding customers and orders...")
        await seed_customers_and_orders(session, products)

        await session.commit()
        print(f"Done! Created {len(products)} products and sample orders.")


if __name__ == "__main__":
    asyncio.run(main())