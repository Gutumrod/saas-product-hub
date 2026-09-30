// Copy-and-own: second-brain-vault 7281e93, tools/platform-sql-review-claude/a7/snapshot.mjs.
// Local adaptation: package-local pg import; same catalog/default-ACL normalization.
// Canonical catalog snapshot of a Postgres database (no OIDs, no volatile fields) -> sorted array of lines.
import pg from "pg";
import crypto from "node:crypto";
const md5 = (s) => crypto.createHash("md5").update(String(s ?? "")).digest("hex");

export async function snapshot(port, db) {
  const c = new pg.Client({ host: "127.0.0.1", port, user: "postgres", database: db });
  await c.connect();
  const q = async (sql) => (await c.query(sql)).rows;
  const lines = [];
  const NORM = { n: 0 };
  const add = (kind, obj) => { if (!process.env.SNAP_RAW && obj && typeof obj.acl === "string" && obj.owner) { const o = obj.owner; const defaults = { database: `{=Tc/${o},${o}=CTc/${o}}`, schema: `{${o}=UC/${o}}`, relation: `{${o}=arwdDxtm/${o}}` }; if (defaults[kind] === obj.acl) { obj = { ...obj, acl: null }; NORM.n++; } } lines.push(`${kind} ${JSON.stringify(obj)}`); };
  const NS = `n.nspname NOT IN ('pg_catalog','information_schema','pg_toast') AND n.nspname !~ '^pg_(toast_)?temp_'`;

  for (const r of await q(`select rolname, rolsuper, rolinherit, rolcreaterole, rolcreatedb, rolcanlogin, rolreplication, rolbypassrls, rolconnlimit, rolvaliduntil::text v, (select array_agg(sc order by sc) from pg_db_role_setting s, unnest(s.setconfig) sc where s.setrole=r.oid) cfg from pg_roles r where rolname !~ '^pg_' and rolname <> 'postgres' order by 1`)) add("role", r);
  for (const r of await q(`select g.rolname grp, m.rolname mem, a.admin_option, a.inherit_option, a.set_option, gr.rolname grantor from pg_auth_members a join pg_roles g on g.oid=a.roleid join pg_roles m on m.oid=a.member join pg_roles gr on gr.oid=a.grantor where g.rolname !~ '^pg_' order by 1,2`)) add("membership", r);
  for (const r of await q(`select datname, pg_get_userbyid(datdba) owner, datacl::text acl from pg_database where datname=current_database()`)) add("database", { ...r, datname: "<current>" });
  for (const r of await q(`select n.nspname, pg_get_userbyid(n.nspowner) owner, n.nspacl::text acl, obj_description(n.oid,'pg_namespace') c from pg_namespace n where ${NS} order by 1`)) add("schema", r);
  for (const r of await q(`select n.nspname, c.relname, c.relkind, pg_get_userbyid(c.relowner) owner, c.relacl::text acl, c.relrowsecurity rls, c.relforcerowsecurity force, c.reloptions::text opts, c.relpersistence, obj_description(c.oid,'pg_class') cm from pg_class c join pg_namespace n on n.oid=c.relnamespace where ${NS} and c.relkind in ('r','p','v','m','f','S','i','c') order by 1,2`)) add("relation", r);
  for (const r of await q(`select n.nspname, c.relname, a.attname, format_type(a.atttypid,a.atttypmod) t, a.attnotnull nn, pg_get_expr(d.adbin,d.adrelid) def, a.attidentity idn, a.attgenerated gen, a.attacl::text acl from pg_attribute a join pg_class c on c.oid=a.attrelid join pg_namespace n on n.oid=c.relnamespace left join pg_attrdef d on d.adrelid=a.attrelid and d.adnum=a.attnum where ${NS} and a.attnum>0 and not a.attisdropped and c.relkind in ('r','p','v','m','f') order by 1,2,a.attnum`)) add("column", r);
  for (const r of await q(`select n.nspname, c.relname, k.conname, pg_get_constraintdef(k.oid) def from pg_constraint k join pg_class c on c.oid=k.conrelid join pg_namespace n on n.oid=c.relnamespace where ${NS} order by 1,2,3`)) add("constraint", r);
  for (const r of await q(`select schemaname, tablename, indexname, indexdef from pg_indexes i where schemaname !~ '^pg_' and schemaname <> 'information_schema' order by 1,2,3`)) add("index", r);
  for (const r of await q(`select n.nspname, c.relname, t.tgname, pg_get_triggerdef(t.oid) def, t.tgenabled from pg_trigger t join pg_class c on c.oid=t.tgrelid join pg_namespace n on n.oid=c.relnamespace where not t.tgisinternal and ${NS} order by 1,2,3`)) add("trigger", r);
  for (const r of await q(`select n.nspname, c.relname, p.polname, p.polcmd, (select array_agg(case when x=0 then 'public' else pg_get_userbyid(x) end order by 1) from unnest(p.polroles) x) roles, pg_get_expr(p.polqual,p.polrelid) qual, pg_get_expr(p.polwithcheck,p.polrelid) wc, p.polpermissive from pg_policy p join pg_class c on c.oid=p.polrelid join pg_namespace n on n.oid=c.relnamespace where ${NS} order by 1,2,3`)) add("policy", r);
  for (const r of await q(`select n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) args, pg_get_userbyid(p.proowner) owner, p.proacl::text acl, l.lanname language, p.prosecdef, p.proconfig::text cfg, p.provolatile, p.prokind, p.proleakproof, md5(pg_get_functiondef(p.oid)) def_md5 from pg_proc p join pg_namespace n on n.oid=p.pronamespace join pg_language l on l.oid=p.prolang where ${NS} and n.nspname not in ('extensions') order by 1,2,3`)) add("function", r);
  for (const r of await q(`select n.nspname, c.relname, pg_get_userbyid(c.relowner) owner, pg_get_viewdef(c.oid, false) definition from pg_class c join pg_namespace n on n.oid=c.relnamespace where ${NS} and c.relkind in ('v','m') order by 1,2`)) add("viewdef", r);
  for (const r of await q(`select pg_get_userbyid(d.defaclrole) role, coalesce(n.nspname,'<all>') ns, d.defaclobjtype, d.defaclacl::text from pg_default_acl d left join pg_namespace n on n.oid=d.defaclnamespace order by 1,2,3`)) add("defacl", r);
  for (const r of await q(`select n.nspname, t.typname, t.typtype, pg_get_userbyid(t.typowner) owner, t.typacl::text acl from pg_type t join pg_namespace n on n.oid=t.typnamespace where ${NS} and t.typtype in ('e','d','c') and not exists (select 1 from pg_class c where c.reltype=t.oid) order by 1,2`)) add("type", r);
  for (const r of await q(`select evtname, evtevent, pg_get_userbyid(evtowner) owner from pg_event_trigger order by 1`)) add("eventtrigger", r);
  // data: exact row counts for every ordinary table outside system schemas
  for (const r of await q(`select n.nspname, c.relname from pg_class c join pg_namespace n on n.oid=c.relnamespace where ${NS} and c.relkind in ('r','p') order by 1,2`)) {
    const cnt = (await q(`select count(*)::bigint n, md5(coalesce(string_agg(t::text, '|' order by t::text),'')) h from ${JSON.stringify(r.nspname)}.${JSON.stringify(r.relname)} t`))[0];
    add("data", { ns: r.nspname, rel: r.relname, n: cnt.n, h: cnt.h });
  }
  await c.end();
  lines.normalized = NORM.n;
  return lines.sort();
}
export function diffLines(a, b) {
  const A = new Set(a), B = new Set(b);
  return { onlyBefore: a.filter((x) => !B.has(x)), onlyAfter: b.filter((x) => !A.has(x)) };
}
