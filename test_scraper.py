import re
import csv
import time
from playwright.sync_api import sync_playwright

def scrape_prompts():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36")
        page = context.new_page()

        # 1. Get Categories (Just Finance for test)
        categories = [{'name': 'finance', 'url': 'https://www.godofprompt.ai/prompts?category=finance&premium=true'}]
        
        all_prompts = []

        # 2. Scrape each category
        for cat in categories:
            print(f"\nScraping Category: {cat['name']}")
            try:
                page.goto(cat['url'])
                try:
                    page.wait_for_selector('.new-prompt-card', timeout=10000)
                except:
                    print(f"No prompts found for {cat['name']} (timeout)")
                    continue

                # Limit to 1 page for test
                page_num = 1
                max_pages = 1
                
                while page_num <= max_pages:
                    print(f"  Processing page {page_num}...")
                    time.sleep(2) 
                    
                    cards = page.locator('.new-prompt-card').all()
                    print(f"    Found {len(cards)} cards on this page.")
                    
                    for card in cards:
                        try:
                            title_el = card.locator('h3').first
                            desc_el = card.locator('.card-description-regular').first
                            
                            title = title_el.inner_text().strip() if title_el.count() > 0 else "No Title"
                            desc = desc_el.inner_text().strip() if desc_el.count() > 0 else "No Description"
                            
                            all_prompts.append({
                                'Category': cat['name'],
                                'Title': title,
                                'Description': desc
                            })
                        except Exception as e:
                            print(f"    Error parsing card: {e}")

                    page_num += 1
                    
            except Exception as e:
                print(f"Error scraping category {cat['name']}: {e}")

        browser.close()

        # 3. Save to CSV
        if all_prompts:
            keys = all_prompts[0].keys()
            with open('test_prompts.csv', 'w', newline='', encoding='utf-8') as output_file:
                dict_writer = csv.DictWriter(output_file, fieldnames=keys)
                dict_writer.writeheader()
                dict_writer.writerows(all_prompts)
            print("Saved to test_prompts.csv")

if __name__ == "__main__":
    scrape_prompts()

