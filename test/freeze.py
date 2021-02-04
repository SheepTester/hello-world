import asyncio
import sys
# https://github.com/encode/httpx/issues/914#issuecomment-622586610
if sys.version_info[0] == 3 and sys.version_info[1] >= 8 and sys.platform.startswith('win'):
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

async def test():
    loop = asyncio.get_running_loop()
    future = loop.create_future()
    print('awaiting future')
    await future
    print('future done')

asyncio.run(test())
