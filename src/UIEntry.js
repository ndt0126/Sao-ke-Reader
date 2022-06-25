
import T from './T';

export default function UIEntry(props) {
    const { idx, dir, file, line, ngayGD, ngayFX, note, mNote, code, val, valClass, delta, search, selected } = props.p;
    const onSelect = props.onSelect;

    let dimNote = valClass == "toosmall";
    let selectedClass = selected ? "selectedEntry" : "";

    return (
      <div className={"entry " + selectedClass} onClick={() => onSelect(idx)} >
        <div className="idx"> {idx} </div>
        <div className={"ngayGD"}> {ngayGD} </div>
        <div className={"dir " + dir}> {dir} </div>
        <div className={"val " + valClass}> {T.currFormat(val).replace('-', '')} </div>

        <div className='notePa'>
          { !(0 < mNote?.length) ? null :
            <div className={"mNote"}> {mNote} </div>
          }
          <div className={"note " + note + " " + (dimNote ? "toosmall" : "")}> {note} </div>
        </div>



      </div>
    );
  }