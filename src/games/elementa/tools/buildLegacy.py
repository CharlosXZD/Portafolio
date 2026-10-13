"""How components/legacy/ was generated (VISUALS.md V8.0). Kept for the record: it is a one-time recovery.
Running it again OVERWRITES the hand edits made afterwards (LegacyGame.jsx exports LegacyGameInner and has no providers or ErrorBoundary; legacy/OptionsScreen.jsx has the Visual style switch; DiceTray and the other shared files are untouched). Run from the repo root: python3 src/games/elementa/tools/buildLegacy.py
"""
import subprocess, re, os, posixpath
OLD='4c7ad36'
BASE='src/games/elementa'
def git(*a): return subprocess.run(['git',*a],capture_output=True,text=True,check=True).stdout
old_files=[f for f in git('ls-tree','-r','--name-only',OLD,BASE+'/components/').split('\n') if f]
old_files=[f for f in old_files if '/visuals/' not in f]
changed=set(git('diff','--name-only',OLD,'HEAD','--',BASE+'/components').split('\n'))
changed={f for f in changed if f in old_files}
IMP=re.compile(r"""(from\s+|import\s*\(\s*|import\s+)(['"])(\.{1,2}/[^'"]+)\2""")
def resolve(src,spec):
    return posixpath.normpath(posixpath.join(posixpath.dirname(src),spec))
src_text={f:git('show',f'{OLD}:{f}') for f in old_files+[BASE+'/ElementaGame.jsx']}
# import graph among old component files
def targets(f):
    out=[]
    for m in IMP.finditer(src_text[f]):
        t=resolve(f,m.group(3))
        out.append(t)
    return out
oldset=set(old_files)
graph={f:[t for t in targets(f) if t in oldset] for f in old_files}
legacy=set(changed)
# ElementaGame itself is always legacy-copied
grew=True
while grew:
    grew=False
    for f in old_files:
        if f in legacy: continue
        if any(t in legacy for t in graph[f]):
            legacy.add(f); grew=True
# also files new-tree no longer has? (deleted) must be copied
for f in old_files:
    if not os.path.exists(f): legacy.add(f)
legacy=sorted(legacy)
def newpath(f):
    # old component file -> legacy location if copied, else same
    return BASE+'/components/legacy/'+f[len(BASE+'/components/'):] if f in legacy_set else f
legacy_set=set(legacy)
def rewrite(f,dest):
    text=src_text[f]
    def sub(m):
        spec=m.group(3)
        t=resolve(f,spec)
        # candidates with extension handling
        cand=t
        if cand not in src_text and cand not in oldset:
            for ext in ('.jsx','.js','.css'):
                if cand+ext in oldset or cand+ext in src_text: cand=cand+ext;break
        nt=newpath(cand) if cand in legacy_set else cand
        # non-component targets stay; css/other
        rel=posixpath.relpath(nt,posixpath.dirname(dest))
        if not rel.startswith('.'): rel='./'+rel
        # keep original extension style
        if cand!=t: rel=rel[:-len(cand[len(t):])] if cand[len(t):] else rel
        return f"{m.group(1)}{m.group(2)}{rel}{m.group(2)}"
    return IMP.sub(sub,text)
for f in legacy:
    dest=newpath(f)
    os.makedirs(os.path.dirname(dest),exist_ok=True)
    open(dest,'w').write(rewrite(f,dest))
# the game
g=BASE+'/ElementaGame.jsx'
dest=BASE+'/components/legacy/LegacyGame.jsx'
open(dest,'w').write(rewrite(g,dest))
print(len(legacy),'component files copied')
print('\n'.join(legacy))
