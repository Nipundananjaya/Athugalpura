with open('admin.html', 'r', encoding='utf-8', errors='replace') as f:
    lines = f.readlines()

# Remove duplicate declarations at lines 2363-2368 (0-indexed: 2362-2367)
# Keep the ones defined earlier in the block at ~2327
output = []
skip_next = 0
for i, line in enumerate(lines):
    lineno = i + 1  # 1-indexed
    stripped = line.strip()
    if lineno in (2363, 2364, 2365, 2366, 2367, 2368):
        # skip the duplicate empty line and 3 const declarations
        if stripped in (
            "const tableInput = document.getElementById('tableNumber');",
            "const qrcodeBox = document.getElementById('qrcode');",
            "const qrPlaceholder = document.getElementById('qr-placeholder');",
            ""
        ):
            continue  # skip duplicate
    output.append(line)

with open('admin.html', 'w', encoding='utf-8') as f:
    f.writelines(output)

print('Done. Total lines:', len(output))
