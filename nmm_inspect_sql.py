import re

f = open("novymatrixmedia_export.sql", "r", encoding="utf-8", errors="replace")
tables = []
siteurl = ""
home = ""
admin_email = ""
has_posts = False

for line in f:
    if line.startswith("CREATE TABLE `"):
        t = line.split("`")[1]
        tables.append(t)
    if "INSERT INTO `wp_options`" in line and "siteurl" in line:
        m = re.search(r"'siteurl','([^']+)'", line)
        if m:
            siteurl = m.group(1)
        m2 = re.search(r"'home','([^']+)'", line)
        if m2:
            home = m2.group(1)
    if "INSERT INTO `wp_options`" in line and "admin_email" in line:
        m = re.search(r"'admin_email','([^']+)'", line)
        if m:
            admin_email = m.group(1)
    if "INSERT INTO `wp_posts`" in line:
        has_posts = True

f.close()

print(f"Tables ({len(tables)}):")
for t in tables:
    print(f"  {t}")
print()
print(f"siteurl : {siteurl}")
print(f"home    : {home}")
print(f"email   : {admin_email}")
print(f"has posts: {has_posts}")
