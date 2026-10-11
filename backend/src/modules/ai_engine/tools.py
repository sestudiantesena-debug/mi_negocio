TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "search_products",
            "description": "Buscar productos por nombre, categoría o descripción. Úsalo cuando el cliente pregunte por productos, busque algo específico o quiera ver opciones.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Término de búsqueda: nombre, categoría, característica, etc."},
                    "category": {"type": "string", "description": "Filtrar por categoría específica (opcional)"},
                    "max_price": {"type": "number", "description": "Precio máximo en la moneda local (opcional)"},
                    "limit": {"type": "integer", "default": 5, "description": "Máximo número de resultados (default 5)"}
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_product_details",
            "description": "Obtener detalles completos de un producto específico (precio, stock, descripción, imágenes). Úsalo cuando el cliente pregunte por un producto en particular.",
            "parameters": {
                "type": "object",
                "properties": {
                    "product_id": {"type": "integer", "description": "ID del producto"}
                },
                "required": ["product_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "create_draft_order",
            "description": "Crear un borrador de orden con los items seleccionados por el cliente. Úsalo cuando el cliente haya decidido qué comprar y quiera proceder al pago.",
            "parameters": {
                "type": "object",
                "properties": {
                    "items": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "product_id": {"type": "integer"},
                                "quantity": {"type": "integer", "minimum": 1}
                            },
                            "required": ["product_id", "quantity"]
                        }
                    },
                    "customer_name": {"type": "string", "description": "Nombre del cliente"},
                    "customer_phone": {"type": "string", "description": "Teléfono del cliente (con código de país)"},
                    "customer_email": {"type": "string", "description": "Email del cliente (opcional)"},
                },
                "required": ["items", "customer_name", "customer_phone"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_order_status",
            "description": "Consultar el estado de una orden existente. Úsalo cuando el cliente pregunte por su pedido.",
            "parameters": {
                "type": "object",
                "properties": {
                    "order_number": {"type": "string", "description": "Número de orden (ej: MN-20240115-1234)"}
                },
                "required": ["order_number"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "handoff_to_human",
            "description": "Transferir la conversación a un agente humano. Úsalo cuando el cliente solicite hablar con una persona, tenga una queja compleja, o la IA no pueda resolver su duda.",
            "parameters": {
                "type": "object",
                "properties": {
                    "reason": {
                        "type": "string",
                        "enum": ["COMPLEX_QUERY", "COMPLAINT", "PAYMENT_ISSUE", "TECHNICAL_SUPPORT", "OTHER"],
                        "description": "Razón de la transferencia"
                    },
                    "summary": {"type": "string", "description": "Resumen breve de la conversación para el agente"}
                },
                "required": ["reason", "summary"]
            }
        }
    }
]


TOOL_FUNCTIONS = {
    "search_products": "search_products",
    "get_product_details": "get_product_details",
    "create_draft_order": "create_draft_order",
    "get_order_status": "get_order_status",
    "handoff_to_human": "handoff_to_human",
}