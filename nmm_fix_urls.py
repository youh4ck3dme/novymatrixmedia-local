import subprocess

fix_sql = """
UPDATE wp_options SET option_value = REPLACE(option_value, 'http://localhost:8888', 'http://localhost:8080') WHERE option_name IN ('siteurl','home');
UPDATE wp_postmeta SET meta_value = REPLACE(meta_value, 'http://localhost:8888', 'http://localhost:8080') WHERE meta_value LIKE '%localhost:8888%';
UPDATE wp_posts SET post_content = REPLACE(post_content, 'http://localhost:8888', 'http://localhost:8080') WHERE post_content LIKE '%localhost:8888%';
UPDATE wp_posts SET guid = REPLACE(guid, 'http://localhost:8888', 'http://localhost:8080') WHERE guid LIKE '%localhost:8888%';
SELECT option_name, option_value FROM wp_options WHERE option_name IN ('siteurl','home');
"""

result = subprocess.run(
    ["mysql", "-u", "root", "novymatrixmedia"],
    input=fix_sql,
    capture_output=True,
    text=True,
)
print("STDOUT:", result.stdout)
print("STDERR:", result.stderr)
print("Code:", result.returncode)
