#!/usr/bin/env python3
"""
日経新聞の投資・経済・政治ニュースを取得し、静的HTMLページを生成するスクリプト。
毎朝8時(JST)にGitHub Actionsで実行される。
"""

import datetime
import hashlib
import os
import re
import xml.etree.ElementTree as ET
from email.utils import parsedate_to_datetime
from zoneinfo import ZoneInfo

import requests
from jinja2 import Environment, FileSystemLoader

# ニュースカテゴリとRSSフィードURL
FEED_SOURCES = {
    "経済": [
        "https://assets.nikkei.com/rss/nikkei_economy.rdf",
        "https://news.google.com/rss/search?q=site:nikkei.com+%E7%B5%8C%E6%B8%88&hl=ja&gl=JP&ceid=JP:ja",
    ],
    "マーケット・投資": [
        "https://assets.nikkei.com/rss/nikkei_market.rdf",
        "https://news.google.com/rss/search?q=site:nikkei.com+%E6%8A%95%E8%B3%87+OR+%E6%A0%AA%E5%BC%8F+OR+%E5%82%B5%E5%88%B8+OR+%E7%82%BA%E6%9B%BF&hl=ja&gl=JP&ceid=JP:ja",
    ],
    "政治": [
        "https://assets.nikkei.com/rss/nikkei_politics.rdf",
        "https://news.google.com/rss/search?q=site:nikkei.com+%E6%94%BF%E6%B2%BB&hl=ja&gl=JP&ceid=JP:ja",
    ],
}

# 投資・経済・政治に関連するキーワード（フィルタリング用）
KEYWORDS = [
    "経済", "GDP", "景気", "金融", "日銀", "金利", "インフレ", "デフレ",
    "為替", "円安", "円高", "ドル", "株", "株式", "株価", "日経平均",
    "TOPIX", "投資", "投信", "ETF", "債券", "国債", "利回り",
    "マーケット", "市場", "相場", "上場", "IPO", "決算", "業績",
    "配当", "M&A", "買収", "合併", "TOB",
    "政治", "政府", "首相", "内閣", "国会", "選挙", "政策",
    "予算", "税", "税制", "規制", "法案", "外交", "安全保障",
    "貿易", "関税", "輸出", "輸入", "経常収支", "財政",
    "中央銀行", "FRB", "ECB", "利上げ", "利下げ", "量的緩和",
    "不動産", "REIT", "原油", "資源", "エネルギー",
    "半導体", "AI", "テクノロジー", "DX",
]

JST = ZoneInfo("Asia/Tokyo")
HEADERS = {
    "User-Agent": "NikkeiNewsDigest/1.0 (GitHub Actions; +https://github.com/buffettkaoru/buffett-kaoru-news)"
}

# RDF/RSS名前空間
NAMESPACES = {
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "rss1": "http://purl.org/rss/1.0/",
    "dc": "http://purl.org/dc/elements/1.1/",
    "atom": "http://www.w3.org/2005/Atom",
}


def parse_rss_xml(content: bytes) -> list[dict]:
    """RSS/RDF/Atom XMLを解析してエントリーリストを返す"""
    articles = []
    try:
        root = ET.fromstring(content)
    except ET.ParseError:
        return articles

    tag = root.tag.lower()

    # RSS 2.0形式
    if "rss" in tag or root.find("channel") is not None:
        channel = root.find("channel")
        if channel is None:
            channel = root
        for item in channel.findall("item"):
            title = (item.findtext("title") or "").strip()
            link = (item.findtext("link") or "").strip()
            desc = (item.findtext("description") or "").strip()
            desc = re.sub(r"<[^>]+>", "", desc).strip()

            published = None
            pub_date = item.findtext("pubDate")
            if pub_date:
                try:
                    published = parsedate_to_datetime(pub_date)
                except Exception:
                    pass

            if title and link:
                articles.append({
                    "title": title,
                    "link": link,
                    "summary": desc[:200],
                    "published": published,
                })

    # RDF (RSS 1.0)形式
    elif "rdf" in tag.lower() or root.find("rss1:item", NAMESPACES) is not None:
        for item in root.findall("rss1:item", NAMESPACES):
            title = (item.findtext("rss1:title", namespaces=NAMESPACES) or "").strip()
            link = (item.findtext("rss1:link", namespaces=NAMESPACES) or "").strip()
            desc = (item.findtext("rss1:description", namespaces=NAMESPACES) or "").strip()
            desc = re.sub(r"<[^>]+>", "", desc).strip()

            published = None
            dc_date = item.findtext("dc:date", namespaces=NAMESPACES)
            if dc_date:
                try:
                    published = datetime.datetime.fromisoformat(dc_date)
                except Exception:
                    pass

            if title and link:
                articles.append({
                    "title": title,
                    "link": link,
                    "summary": desc[:200],
                    "published": published,
                })

    # Atom形式
    elif "feed" in tag.lower():
        ns = {"atom": "http://www.w3.org/2005/Atom"}
        for entry in root.findall("atom:entry", ns):
            title = (entry.findtext("atom:title", namespaces=ns) or "").strip()
            link_el = entry.find("atom:link[@rel='alternate']", ns)
            if link_el is None:
                link_el = entry.find("atom:link", ns)
            link = link_el.get("href", "") if link_el is not None else ""
            desc = (entry.findtext("atom:summary", namespaces=ns) or "").strip()
            desc = re.sub(r"<[^>]+>", "", desc).strip()

            published = None
            pub_str = entry.findtext("atom:published", namespaces=ns) or entry.findtext("atom:updated", namespaces=ns)
            if pub_str:
                try:
                    published = datetime.datetime.fromisoformat(pub_str)
                except Exception:
                    pass

            if title and link:
                articles.append({
                    "title": title,
                    "link": link,
                    "summary": desc[:200],
                    "published": published,
                })

    return articles


def fetch_feed(url: str) -> list[dict]:
    """RSSフィードを取得してエントリーのリストを返す"""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=30)
        resp.raise_for_status()
        return parse_rss_xml(resp.content)
    except Exception as e:
        print(f"  [WARNING] フィード取得失敗: {url} - {e}")
        return []


def is_relevant(article: dict) -> bool:
    """記事が投資・経済・政治に関連しているか判定"""
    text = f"{article['title']} {article['summary']}"
    return any(kw in text for kw in KEYWORDS)


def deduplicate(articles: list[dict]) -> list[dict]:
    """タイトルベースで重複を除去"""
    seen = set()
    unique = []
    for article in articles:
        key = hashlib.md5(article["title"].encode()).hexdigest()
        if key not in seen:
            seen.add(key)
            unique.append(article)
    return unique


def fetch_all_news() -> dict[str, list[dict]]:
    """全カテゴリのニュースを取得"""
    categorized_news = {}

    for category, urls in FEED_SOURCES.items():
        print(f"[{category}] ニュースを取得中...")
        all_articles = []

        for url in urls:
            print(f"  フィード: {url[:80]}...")
            articles = fetch_feed(url)
            print(f"  取得件数: {len(articles)}")
            all_articles.extend(articles)

        # 関連性フィルタリング
        filtered = [a for a in all_articles if "nikkei.com" in a.get("link", "") or is_relevant(a)]

        # 重複除去
        unique = deduplicate(filtered)

        # 日時でソート（新しい順）
        unique.sort(
            key=lambda x: x["published"] or datetime.datetime.min.replace(tzinfo=datetime.timezone.utc),
            reverse=True,
        )

        # 各カテゴリ最大20件
        categorized_news[category] = unique[:20]
        print(f"  最終件数: {len(categorized_news[category])}")

    return categorized_news


def generate_html(categorized_news: dict[str, list[dict]]) -> str:
    """Jinja2テンプレートを使ってHTMLを生成"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    template_dir = os.path.join(script_dir, "..", "templates")
    env = Environment(loader=FileSystemLoader(template_dir), autoescape=True)
    template = env.get_template("index.html")

    now_jst = datetime.datetime.now(JST)

    # 公開日時をJSTに変換してフォーマット
    for articles in categorized_news.values():
        for article in articles:
            if article["published"]:
                pub_jst = article["published"].astimezone(JST)
                article["published_str"] = pub_jst.strftime("%m/%d %H:%M")
            else:
                article["published_str"] = ""

    return template.render(
        categorized_news=categorized_news,
        updated_at=now_jst.strftime("%Y年%m月%d日 %H:%M"),
        today_date=now_jst.strftime("%Y年%m月%d日"),
    )


def main():
    print("=" * 60)
    print("日経ニュースダイジェスト - 取得開始")
    print("=" * 60)

    categorized_news = fetch_all_news()

    total = sum(len(articles) for articles in categorized_news.values())
    print(f"\n合計 {total} 件のニュースを取得しました")

    html = generate_html(categorized_news)

    output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "docs")
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "index.html")

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"HTMLファイルを生成しました: {output_path}")


if __name__ == "__main__":
    main()
