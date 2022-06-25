import React, { useEffect, useState } from "react";
import { DateTime } from 'luxon';
import UIEntry from './UIEntry.js';
import T from "./T";
import UITools from "./UITools.js";

function App() {

  const [, updateState] = React.useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);

  const [hasSession, setHasSession] = useState(false);
  const [entries, setEntries] = useState([]);
  const [entriesOrg, setEntriesOrg] = useState([]);
  const [que, setQue] = useState([]);
  const [selecteds, setSelecteds] = useState([]);
  const [sum, setSum] = useState(0);

  const DoSetEntries = (entries) => {
    // console.clear(); 
    console.log('DoSetEntries', entries.length, +new Date());
    let codes = {}; let dupCount = 0; let idx = 1;
    entries = entries.sort(T.sort_by('sort', true, (p) => p));

    let _total = 0;
    entries.forEach(e => {

      e.idx = idx++;
      let valClass = Math.abs(e.val) < 10000 ? 'toosmall' : e.val > 0 ? "positive" : "negative";
      e.valClass = valClass;

      if (Object.keys(codes).includes(e.code)) {
        let o = codes[e.code];
        if (o.val == e.val) {
          if (o.ngayGD == e.ngayGD) {
            dupCount++;
            console.log("DUP " + dupCount, T.currFormat(o.val), (o.val == e.val) ? '==' : '||', T.currFormat(e.val), { old: codes[e.code], new: e });
          }
          else { e.code = e.code + "|" + e.val + "|" + e.ngayGD; }
        }
        else { e.code = e.code + "|" + e.val + "|" + e.ngayGD; }
      }
      else { codes[e.code] = e; }

      _total += parseInt(e.val);

    });

    postProcessEntries(entries, true);

    if (dupCount != 0) console.log('dupCount', dupCount);
    setEntries(entries);
    setSum(_total);
  }

  const postProcessEntries = (_ens, canProceed) => {

    if (!canProceed) {
      return;
    }

    _ens.forEach(e => {      
      e.mNote = localStorage.getItem("mNote_" + T.sanitizeKey(e.code));
      e.search = (e.note + '|' + e.ngayGD + '|' + e.mNote).toLowerCase();
    });
  }

  useEffect(() => {

    setHasSession(0 < sessionStorage.length);
    if (0 < sessionStorage.length) {
      let _ens = readSession();
      postProcessEntries(_ens);
      setEntriesOrg(_ens);
      DoSetEntries(_ens);
    }
  }, []);


  const handleSearchMNote = (_que) => {
    _que = _que.toLowerCase();
    if (selecteds.length > 0) {
      setSelecteds([]);
      updateSelected([]);
    }
    let _ens = 0 < _que?.length ? entriesOrg.filter(p => p.mNote?.includes(_que)) : entriesOrg;
    DoSetEntries(_ens);
  }
  const handleSearch = (_que) => {
    _que = _que.toLowerCase();
    if (selecteds.length > 0) {
      setSelecteds([]);
      updateSelected([]);
    }
    setQue(_que);
    let _ens = 0 < _que?.length ? entriesOrg.filter(p => p.search?.includes(_que)) : entriesOrg;
    DoSetEntries(_ens);
  }

  const showNoMNote = () => {
    setSelecteds([]);
    updateSelected([]);
    setQue('');
    let _ens = entriesOrg.filter(p => !(0 < p.mNote?.length));
    DoSetEntries(_ens);
  }

  const showNoMNoteOnly = () => {
    setSelecteds([]);
    updateSelected([]);
    setQue('');
    let _ens = entries.filter(p => !(0 < p.mNote?.length));
    DoSetEntries(_ens);
  }




  const updateSelected = (_selecteds) => {
    entries.forEach(e => {  e.selected = _selecteds.includes(e.idx); })
    DoSetEntries(entries);
    forceUpdate();
  }

  const onSelect = (idx) => {
    if (!selecteds.includes(idx)) {
      selecteds.push(idx);
    }      
    else {
      for( var i = 0; i < selecteds.length; i++){ 
        if ( selecteds[i] === idx) { 
          selecteds.splice(i, 1); 
        }
      }
    }

    updateSelected(selecteds);
    setSelecteds(selecteds);
  }
  
  const selectAll = () => {
    entries.forEach(e => { 
      e.selected = true; 
      selecteds.push(e.idx);
    })
    DoSetEntries(entries);
    forceUpdate();
    setSelecteds(selecteds);
  }
  const selectNone = () => {
    entries.forEach(e => {  e.selected = false;  })
    DoSetEntries(entries);
    forceUpdate();
    setSelecteds([]);
  }



  return (
      <div>
        <div className="entriesPa">
          { (entries ?? []).map((p, k) => { return (
              <UIEntry key={p.code} p={p} onSelect={onSelect} />
            ); }) }
        </div>

        <UITools p={{ sum, entries, entriesOrg, selecteds, openDir, setHasSession, readSession, DoSetEntries, que, handleSearchMNote, handleSearch
          , forceUpdate, selectAll, selectNone, showNoMNote, showNoMNoteOnly }} />
      </div>
  );
}

export default App;





const openDir = async (setHasSession, readSession, DoSetEntries) => { 
  sessionStorage.clear();
  const dirHandle = await window.showDirectoryPicker();

  for await (let [name, handle] of dirHandle) {
    if (handle.kind !== 'directory') { continue; }
    openFiles(name, handle, setHasSession, readSession, DoSetEntries);
  }
}
const openFiles = async (dirName, dirHandle, setHasSession, readSession, DoSetEntries) => { 
  // const dirHandle = await window.showDirectoryPicker();
  const promises = [];
  for await (const entry of dirHandle.values()) {
    if (entry.kind !== 'file') { continue; }
    promises.push(entry.getFile());
  }
  
  let files = await Promise.all(promises);

  files.forEach(file => {
    
    let reader = new FileReader();
    reader.readAsText(file);

    reader.onload = function() {
      let key = dirName + '^' + file.name.replace('.csv','');
      sessionStorage.setItem(key, reader.result);
      console.log("READ", key /* , reader.result */ );
    };
  
    reader.onerror = function() {
      sessionStorage.setItem(file.name.replace('.csv',''), reader.error);
      console.error("ERROR", file.name, reader.error);
    };

  });
  setHasSession(true);
  // TODO session is not done writing here
  DoSetEntries(readSession());
}


const readSession = () => {
  // console.log('readSession', sessionStorage.length);
  let filesEntries = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    const fileContent = sessionStorage.getItem(key);
    let entries = readSessionKey(key, fileContent);
    // console.log("read file " + fileName, entries.length);
    entries.forEach(e => { filesEntries.push(e); });
  }
  // console.log("filesEntries ", filesEntries.length);
  return filesEntries;
}

const readVietin = (key, content) => {
  let lines = content.split('\n');
  let entries = []; let ready = false;
  for (let i = 0; i < lines.length; i++) {
    let line = T.replaceAll(lines[i], ',', '');
    line = T.replaceAll(line, '"', '');

    let pp = line.split('|');
    let date = pp[0];
    let note = pp[1];
    let val = T.replaceAll(pp[2].replace('+',''), ',', '');
    let delta = pp[3];
    
    let sort = DateTime.fromFormat(date, "dd/MM/yyyy hh:mm:ss", { zone: 'UTC+7' })
    .toFormat('yyyyMMdd');

    let split = key.split('^');

    let entry = { sort, dir: split[0], file: split[1], line: i, ngayGD: date, ngayFX: date, note, code: date, val, delta };
    // console.log('entry', entry);
    entries.push(entry);
  }

  return entries;
}

const readSessionKey = (key, content) => {

  if (key == "vietin^vietin") {
    return readVietin(key, content);
  }

  let lines = content.split('\n');
  
  let entries = [];
  for (let i = 0; i < lines.length; i++) {
    let line = T.replaceAll(lines[i], '","', '|');
    line = T.replaceAll(line, '"', '');
    line = T.replaceAll(line, ',', '');
    line = T.replaceAll(line, ' VND', '');
    line = T.replaceAll(line, '--', '0');

    let pp = line.split('|');
    let _0 = pp[0].substring(0, 2);
    if (isNaN(_0) || _0.length < 2) { continue; }
    
    let val = -99999999999999999;
    if (pp[4] > 0 && pp[5] == 0) { val = -1 * pp[4]; }
    else if (pp[4] == 0 && pp[5] > 0) { val = pp[5]; }
    else { 
      console.error('err parse pp[4] & pp[5] ', pp[4], pp[5]); 
    }


    let sort = DateTime.fromFormat(pp[0], "dd/MM/yyyy hh:mm:ss", { zone: 'UTC+7' })
        .toFormat('yyyyMMdd');

    let split = key.split('^');

    let entry = { sort, dir: split[0], file: split[1], line: i, ngayGD: pp[0], ngayFX: pp[1], note: pp[2], code: pp[3], val, delta: pp[6] };
    // console.log('entry', entry);
    entries.push(entry);
  }

  return entries;
}