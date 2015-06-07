import sys, json
from pyzotero import zotero

# shortcut for print
def success(msg):
  print '{ "status": "success", "msg": "' + msg + '" }'
def fail(msg):
  print '{ "status": "fail", "msg": "' + msg + '"" }'

# zotero-related procedures
def client(conf):
  return zotero.Zotero(args['user'], args['lib'], args['key'])

def create(client, items):
  return True

def upload(client, files, items):
  try:
    if len(items) == 0:
      ul = client.attachment_simple(files)
    else:
      ul = client.attachment_both(files, items)
    return json.dumps(ul)
  except Exception as inst:
    if str(inst) == "u'prefix'": # handle weird unicode bug :) (hack)
      return True
    else:
      return str(inst)

# script public api listening to stdin
for msg in sys.stdin:
    args = json.loads(msg)

    if args['subject'] == 'config':
      zot = client(args)
      success('configured')

    if args['subject'] == 'create':
      resp = create(zot, args['items'])
      if resp:
        success('created')
      else:
        fail(resp)

    if args['subject'] == 'upload':
      resp = upload(zot, args['files'], [])
      if resp == True:
        success('uploaded')
      else:
        fail(resp)