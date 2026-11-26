'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Nav({ items, badge }) {
  const p = usePathname();
  return items.map(([href, label, key]) => {
    const on = href === '/' ? p === '/' : p.startsWith(href);
    return <Link key={href} href={href} className={on ? 'on' : ''}>{label}{key === 'pindah' && badge > 0 ? ` (${badge})` : ''}</Link>;
  });
}
