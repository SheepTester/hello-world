from youtube_search import YoutubeSearch
import json
from yt_dlp import YoutubeDL
import scrapetube


def downloadBySearch():
    videos = []
    results = json.loads(YoutubeSearch('TFT Clips', max_results=10).to_json())
    for video in results["videos"]:
        videos.append("https://www.youtube.com" + video["url_suffix"])
    with YoutubeDL() as ydl:
        ydl.download(videos)


def downloadByChannel():
    videos = scrapetube.get_channel(
        channel_url="https://www.youtube.com/@Caedrel")
    videoLinks = []
    for video in videos:
        id = video["videoId"]
        videoLinks.append("https://www.youtube.com/watch?v=" + id)
    print(len(videoLinks))
    with YoutubeDL() as ydl:
        ydl.download(videoLinks)


downloadByChannel()
