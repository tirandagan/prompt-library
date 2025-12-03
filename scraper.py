import re
import csv
import time
from playwright.sync_api import sync_playwright

import argparse

def scrape_prompts():
    parser = argparse.ArgumentParser()
    parser.add_argument('--test_mode', action='store_true', help='Run in test mode (collect only 5 prompts)')
    args = parser.parse_args()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
        )
        
        # We'll use a persistent page for the listing, and maybe the same or new for details
        page = context.new_page()

        # 1. Get Categories
        print("Visiting main library page...")
        try:
            page.goto('https://www.godofprompt.ai/prompt-library', timeout=60000)
            page.wait_for_load_state('networkidle', timeout=10000)
        except Exception as e:
            print(f"Warning loading main page: {e}")

        category_links = page.locator('a[href*="category="]').all()
        
        categories = []
        seen_urls = set()
        
        print(f"Found {len(category_links)} potential category links.")
        
        for link in category_links:
            url = link.get_attribute('href')
            if url and url not in seen_urls:
                if url.startswith('/'):
                    url = 'https://www.godofprompt.ai' + url
                
                match = re.search(r'category=([^&]+)', url)
                name = match.group(1) if match else "Unknown"
                
                categories.append({'name': name, 'url': url})
                seen_urls.add(url)
                print(f"  - Category: {name}")

        # 2. Collect all prompt URLs from all categories
        # Store as dicts: {Category, Title, Description, Url}
        prompts_to_scrape = []

        for cat in categories:
            print(f"\n--- Collecting from Category: {cat['name']} ---")
            try:
                page.goto(cat['url'], timeout=60000)
                try:
                    page.wait_for_selector('.new-prompt-card', timeout=10000)
                except:
                    print(f"  No prompts found for {cat['name']} (or timeout).")
                    continue

                page_num = 1
                while True:
                    print(f"  Scanning page {page_num}...")
                    time.sleep(2) # wait for dynamic content
                    
                    cards = page.locator('.new-prompt-card').all()
                    print(f"    Found {len(cards)} cards.")
                    
                    for card in cards:
                        try:
                            title_el = card.locator('h3').first
                            desc_el = card.locator('.card-description-regular').first
                            link_el = card.locator('a.new-prompt-link-wrp').first
                            
                            title = title_el.inner_text().strip() if title_el.count() > 0 else "No Title"
                            desc = desc_el.inner_text().strip() if desc_el.count() > 0 else "No Description"
                            
                            link = None
                            if link_el.count() > 0:
                                href = link_el.get_attribute('href')
                                if href:
                                    if href.startswith('/'):
                                        link = 'https://www.godofprompt.ai' + href
                                    else:
                                        link = href
                            
                            if link:
                                prompts_to_scrape.append({
                                    'Category': cat['name'],
                                    'Title': title,
                                    'Description': desc,
                                    'Link': link
                                })
                        except Exception as e:
                            print(f"    Error parsing card: {e}")

                        if args.test_mode and len(prompts_to_scrape) >= 5:
                            print("    Test mode limit reached (5 prompts). Stopping collection.")
                            break
                    
                    if args.test_mode and len(prompts_to_scrape) >= 5:
                        break

                    # Pagination
                    next_btn = page.locator('.pagination-button-new.next').first
                    if next_btn.count() > 0 and next_btn.is_visible():
                        next_btn.click()
                        page_num += 1
                    else:
                        print("    End of category.")
                        break
            except Exception as e:
                print(f"Error scraping category listing {cat['name']}: {e}")
            
            if args.test_mode and len(prompts_to_scrape) >= 5:
                break

        # 3. Visit each prompt details page
        print(f"\n--- Visiting {len(prompts_to_scrape)} Prompt Details Pages ---")
        
        detailed_prompts = []
        for i, item in enumerate(prompts_to_scrape):
            print(f"[{i+1}/{len(prompts_to_scrape)}] {item['Title']}...")
            
            # Retry logic for individual pages
            max_retries = 2
            for attempt in range(max_retries):
                try:
                    page.goto(item['Link'], timeout=30000)
                    # Wait for content to stabilize
                    try:
                        # Wait for at least one H2 to ensure meaningful content is loaded
                        page.wait_for_selector('h2', timeout=10000)
                        # Small buffer for hydration
                        time.sleep(1) 
                    except:
                        pass
                    
                    # Extract fields
                    what_does = ""
                    tips = ""
                    
                    # Selector strategy: H2 -> Parent -> Next Sibling .w-richtext
                    
                    # 1. What This Prompt Does
                    # Use specific text locator with waitFor to ensure it's present if it exists
                    try:
                        h2_does = page.locator('h2:has-text("What This Prompt Does:")').first
                        if h2_does.is_visible(timeout=2000):
                            # content is sibling of parent container
                            content_el = h2_does.locator('..').locator('xpath=following-sibling::div[contains(@class, "w-richtext")]').first
                            what_does = content_el.inner_text().strip()
                    except:
                        pass
                    
                    # 2. Tips
                    try:
                        h2_tips = page.locator('h2:has-text("Tips:")').first
                        if h2_tips.is_visible(timeout=2000):
                            content_el = h2_tips.locator('..').locator('xpath=following-sibling::div[contains(@class, "w-richtext")]').first
                            tips = content_el.inner_text().strip()
                    except:
                        pass

                    detailed_item = item.copy()
                    detailed_item['What this prompt does'] = what_does
                    detailed_item['Tips'] = tips
                    detailed_prompts.append(detailed_item)
                    break # Success, exit retry loop

                except Exception as e:
                    print(f"  Error visiting {item['Link']}: {e}")
                    if attempt == max_retries - 1:
                        # Keep partial data if failed
                        detailed_item = item.copy()
                        detailed_item['What this prompt does'] = "Error"
                        detailed_item['Tips'] = "Error"
                        detailed_prompts.append(detailed_item)

        browser.close()

        # 4. Save to CSV
        print(f"\nTotal collected: {len(detailed_prompts)}")
        if detailed_prompts:
            keys = ['Category', 'Title', 'Description', 'What this prompt does', 'Tips', 'Link']
            # Filter keys to ensure order and existence
            
            with open('prompts_detailed.csv', 'w', newline='', encoding='utf-8') as output_file:
                dict_writer = csv.DictWriter(output_file, fieldnames=keys)
                dict_writer.writeheader()
                for p_data in detailed_prompts:
                    # Ensure only valid keys are written
                    row = {k: p_data.get(k, '') for k in keys}
                    dict_writer.writerow(row)
            print("Saved to prompts_detailed.csv")
        else:
            print("No data collected.")

if __name__ == "__main__":
    scrape_prompts()
