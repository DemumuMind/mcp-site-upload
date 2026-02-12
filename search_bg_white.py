import os
for root, dirs, files in os.walk('.'):
    if root.startswith('./.git') or root.startswith('./.next'):
        continue
    for f in files:
        path = os.path.join(root, f)
        if '.git' in path.split(os.sep) or '.next' in path.split(os.sep):
            continue
        try:
            with open(path, 'r', encoding='utf-8') as fh:
                data = fh.read()
        except Exception:
            continue
        if 'bg-white' in data:
            print(path)
