import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
export function localDB(filename=':memory:'){
  const database=new DatabaseSync(filename);for(const file of readdirSync(new URL('../drizzle/',import.meta.url)).filter(file=>file.endsWith('.sql')).sort())database.exec(readFileSync(new URL('../drizzle/'+file,import.meta.url),'utf8'));
  const wrap=(sql,values=[])=>({bind(...bindings){return wrap(sql,bindings);},execute(){const statement=database.prepare(sql);if(/\bRETURNING\b|^\s*SELECT/i.test(sql))return {success:true,results:statement.all(...values)};const result=statement.run(...values);return {success:true,results:[],meta:{changes:Number(result.changes)}};},async first(){return this.execute().results[0]??null;},async all(){return this.execute();},async run(){return this.execute();}});
  return {prepare:sql=>wrap(sql),async batch(statements){database.exec('BEGIN');try{const results=statements.map(statement=>statement.execute());database.exec('COMMIT');return results;}catch(error){database.exec('ROLLBACK');throw error;}},close:()=>database.close(),raw:database};
}
