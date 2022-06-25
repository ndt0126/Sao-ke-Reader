import { useState } from 'react';
import T from './T';

export default function UITools(props) {

    const { sum, entries, entriesOrg, selecteds, openDir, setHasSession, readSession, DoSetEntries, que, handleSearchMNote, handleSearch, forceUpdate, selectAll, selectNone, showNoMNote, showNoMNoteOnly } = props.p;

    const [mNote, setMNote] = useState('');


    const _setMNote = async () => {

        entries.forEach(e => {
            if (e.selected) {
                localStorage.setItem("mNote_" + T.sanitizeKey(e.code), mNote);
                e.mNote = mNote;
            }
        })

        DoSetEntries(entries);
        forceUpdate();
    }

    const _saveMNotes = async () => {
        console.log('start saving MNotes');
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const content = localStorage.getItem(key);
            data[key] = content;
        }
        console.log('saving ' + Object.keys(data).length);
        T.writeFile(JSON.stringify(data));
    }


    return (
        <div className="toolsPa">
          <button onClick={ async (e) => openDir(setHasSession, readSession, DoSetEntries)} >
              {`IMPORT CSV ${entries.length}`}
          </button>
          <div className={"val"}> {T.currFormat(sum)} </div>
          
          <div style={{ marginLeft: '10pt' }} >🔍<br/>mNote</div>
          <input type={'name'} onChange={e => handleSearchMNote(e.target.value)} />     

          <div style={{ marginLeft: '10pt' }} >🔍<br/>note</div>
          <input type={'name'} value={que} onChange={e => handleSearch(e.target.value)} />          
          <button className="buttClear" onClick={ async (e) => handleSearch('')} > {`X`} </button>

          <button className="buttSelectAll" onClick={ async (e) => selectAll()} > {`ALL`} </button>
          <button className="buttSelectAll" onClick={ async (e) => selectNone()} > {`NONE`} </button>
          <button className="buttSelectAll" onClick={ async (e) => showNoMNote()} > {`No mNote`} </button>
          <button className="buttSelectAll" onClick={ async (e) => showNoMNoteOnly()} > {`No mNote Only`} </button>

          <div style={{ marginLeft: '10pt' }} >✎<br/>mNote</div>
          <input type={'name'} value={mNote} onChange={e => setMNote(e.target.value)} />
          <button className="buttClear" onClick={ async (e) => _setMNote()} > {`SET ${selecteds?.length}`} </button>
          <button className="buttClear" onClick={ async (e) => _saveMNotes()} > {`SAVE`} </button>
          <button className="buttClear" onClick={ async (e) => T.showStats(entriesOrg)} > {`stats`} </button>

        </div>
      );
}