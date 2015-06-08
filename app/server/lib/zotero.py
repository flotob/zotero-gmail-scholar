# # # # # # # # # # # # # # # # # # # # # # # # #
# PYZOTERO-NODEJS-BRIDGE                        #
# --------------------------------------------- #
# stdin serves as the comms channel with nodejs #
# stdin can be written to via print 'statement' #
# # # # # # # # # # # # # # # # # # # # # # # # #

import sys, json, collections
from pyzotero import zotero

# helper for utf8 bullshit, fck python2.x
def convert(data):
  if isinstance(data, basestring):
    return str(data)
  elif isinstance(data, collections.Mapping):
    return dict(map(convert, data.iteritems()))
  elif isinstance(data, collections.Iterable):
    return type(data)(map(convert, data))
  else:
    return data

# create zotero client
def client(conf):
  return zotero.Zotero(conf['user'], conf['lib'], conf['key'])

# upload files (pdfs) as standalone or attach to zotero files
def upload(client, files, parent):
  try:
    ul = client.attachment_simple(files, parent)
    return json.dumps(convert(ul))
  except Exception as inst:
    if str(inst) == "u'prefix'": # handle weird unicode bug :) (hack) // persists despite conversion of incoming stdin data
      return True
    else:
      return str(inst)

# create zotero files and save to zotero library
def create(client, items):
  failed = []

  for item in items:
    # save attachments and clean up dataset to conform with zotero api
    if 'files' in item:
      if item['files']:
        files = item['files']
      del item['files']

    # enrich with template data corresponding to itemType
    template = client.item_template(item['itemType'])
    template.update(item)

    # sent request and deal with reply
    resp = client.create_items([template])
    if resp['failed']:
      failed.append(resp['failed'])
    elif 'files' in locals() and resp['success']:
      upload(client, files, resp['success']['0'])
    
  return failed if failed else True

# shortcuts for print (public comms channel with nodejs)
def success(msg):
  print '{ "status": "success", "msg": "' + convert(msg) + '" }'
def fail(msg):
  print '{ "status": "fail", "msg": "' + convert(msg) + '" }'      

# public api listening to stdin
for msg in sys.stdin:
  args = convert(json.loads(msg))

  # set credentials etc.
  if args['subject'] == 'auth':
    zot = client(args)
    success('authenticated')

  # create zotero files and upload if files array is given
  if args['subject'] == 'create':
    if 'zot' in locals() or 'auth' in args:
      zot = zot if 'zot' in locals() else client(args['auth'])
      resp = create(zot, args['items'])
      if resp == True:
        success('created')
      else:
        fail(resp)
    else:
      fail('no auth info given')

  # directly upload files
  if args['subject'] == 'upload':
    resp = upload(zot, args['files'], args['parent'] if 'parent' in args else '' )
    if resp == True:
      success('uploaded')
    else:
      fail(resp)