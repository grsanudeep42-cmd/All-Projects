from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()

# In-memory structure: {conversation_id: [WebSocket, ...]}
active_connections = {}

@router.websocket("/ws/chat/{conversation_id}")
async def websocket_endpoint(websocket: WebSocket, conversation_id: int):
    await websocket.accept()
    if conversation_id not in active_connections:
        active_connections[conversation_id] = []
    active_connections[conversation_id].append(websocket)
    try:
        while True:
            data = await websocket.receive_json()
            for conn in active_connections[conversation_id]:
                await conn.send_json(data)
    except WebSocketDisconnect:
        active_connections[conversation_id].remove(websocket)
        if not active_connections[conversation_id]:
            del active_connections[conversation_id]
