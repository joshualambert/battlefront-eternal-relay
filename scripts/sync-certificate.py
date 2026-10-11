#!/usr/bin/env python3
"""Host-only NPM certificate renewal bridge. Never logs private key material."""
import hashlib,os,subprocess,shutil,tempfile
from pathlib import Path
source=Path(os.environ.get('NPM_CERT_PATH','/data/compose/1/letsencrypt/live/npm-78'))
root=Path('/opt/battlefront-eternal/certs');root.mkdir(parents=True,exist_ok=True,mode=0o750);os.chown(root,0,1000)
def command(*args):return subprocess.check_output(args,stderr=subprocess.PIPE)
with tempfile.TemporaryDirectory(dir=root) as temporary:
 stage=Path(temporary)
 for name in ['fullchain.pem','privkey.pem']:shutil.copyfile(source/name,stage/name)
 cert=stage/'fullchain.pem';key=stage/'privkey.pem'
 command('openssl','x509','-in',str(cert),'-noout','-checkhost','relay.battlefronteternal.com')
 command('openssl','x509','-in',str(cert),'-noout','-checkend','604800')
 pub=command('openssl','x509','-in',str(cert),'-pubkey','-noout')
 if pub!=command('openssl','pkey','-in',str(key),'-pubout'):raise RuntimeError('certificate key mismatch')
 digest=hashlib.sha256(cert.read_bytes()+pub).hexdigest()
 version=root/digest
 if (root/'current').exists() and (root/'current').resolve()==version:raise SystemExit(0)
 if not version.exists():
  version.mkdir(mode=0o750);os.chown(version,0,1000)
  for name in ['fullchain.pem','privkey.pem']:
   shutil.copyfile(stage/name,version/name);os.chmod(version/name,0o640);os.chown(version/name,0,1000)
 nextlink=root/'next';nextlink.unlink(missing_ok=True);nextlink.symlink_to(digest);nextlink.replace(root/'current')
 # coturn's restart is controlled but interrupts allocations. The client must reconnect.
 containers=command('docker','ps','--filter','name=^battlefront-eternal-relay-production$','--format','{{.Names}}').decode().strip()
 if containers:command('docker','restart','battlefront-eternal-relay-production')
 print('Relay certificate synchronized; expires at least seven days from now.')
