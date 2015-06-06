import sys, json
from pyzotero import zotero

# zot = zotero.Zotero(library_id, library_type, api_key)



for msg in sys.stdin:
    args = json.loads(msg)

    if args['subject'] == 'config':
      print 'config'

    if args['subject'] == 'upload':
      print 'upload'

# zot = zotero.Zotero(library_id, library_type, api_key)
# items = zot.top(limit=5)
# # we've retrieved the latest five top-level items in our library
# # we can print each item's item type and ID
# for item in items:
#     print('Item: %s | Key: %s') % (item['data']['itemType'], item['data']['key'])

# for line in sys.stdin:
#     print line;

# text_file = open("debug.log", "w")
# text_file.write()
# text_file.close()