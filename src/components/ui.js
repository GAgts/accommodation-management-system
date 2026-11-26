export function Chip({ s }) { return <span className={'chip c-' + String(s).replace(/\W/g, '')}>{s}</span>; }
export function Head({ title, sub, children }) {
  return (<header className="ph"><div><h1>{title}</h1>{sub && <p>{sub}</p>}</div>{children}</header>);
}
export function Strip({ items }) {
  return (<div className="strip">{items.map(([l, v]) => <div key={l}><b>{v}</b><span>{l}</span></div>)}</div>);
}
export function Bars({ items, total }) {
  return items.map(([l, v]) => (
    <div className="br" key={l}><span>{l}</span><em><i style={{ width: (total ? (v / total) * 100 : 0) + '%' }} /></em><u>{v}</u></div>
  ));
}
export function Msg({ e }) { return e ? <p className="err">{e}</p> : null; }
export function Empty({ text }) { return <p className="empty">{text || 'Belum ada data yang cocok.'}</p>; }
export function Opts({ list, value }) {
  return list.map((x) => { const [v, l] = Array.isArray(x) ? x : [x, x]; return <option key={v} value={v}>{l}</option>; });
}
