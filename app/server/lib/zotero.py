import sys, json
from pyzotero import zotero

for msg in sys.stdin:
    args = json.loads(msg)

    if args['subject'] == 'config':
      zot = zotero.Zotero(args['user'], args['lib'], args['key'])
      print '{ "status": "success", "msg": "configured" }'

    if args['subject'] == 'upload':
      ul = zot.attachment_simple(args['files'])
      print '{ "status": "success", "msg": ' + json.dumps(ul) + ' }'