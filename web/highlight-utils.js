/* Offsets use JavaScript UTF-16 indices, matching textarea selectionStart/End. */
globalThis.VirastHighlights = (() => {
  const colors = ['#fff3a3', '#bbf7d0', '#bfdbfe', '#fbcfe8'];
  function clean(ranges, length) {
    return (Array.isArray(ranges) ? ranges : []).filter(r => r &&
      Number.isInteger(r.start) && Number.isInteger(r.end) &&
      r.start >= 0 && r.end > r.start && r.end <= length && colors.includes(r.color))
      .map(r => ({start:r.start,end:r.end,color:r.color}));
  }
  function paint(ranges, start, end, color, length) {
    const result=[];
    for (const r of clean(ranges,length)) {
      if(r.end<=start || r.start>=end) result.push(r);
      else {
        if(r.start<start) result.push({...r,end:start});
        if(r.end>end) result.push({...r,start:end});
      }
    }
    if(color && colors.includes(color) && end>start) result.push({start,end,color});
    return result.sort((a,b)=>a.start-b.start);
  }
  function edit(ranges, before, after) {
    if(before===after) return clean(ranges,after.length);
    let start=0;
    while(start<before.length && start<after.length && before[start]===after[start]) start++;
    let oldEnd=before.length,newEnd=after.length;
    while(oldEnd>start && newEnd>start && before[oldEnd-1]===after[newEnd-1]) {oldEnd--;newEnd--;}
    const shift=newEnd-oldEnd,result=[];
    for(const r of clean(ranges,before.length)) {
      if(r.end<=start) result.push(r);
      else if(r.start>=oldEnd) result.push({...r,start:r.start+shift,end:r.end+shift});
      else {
        // Preserve the highlighted portions of text surviving the edit.
        if(r.start<start) result.push({...r,end:start});
        if(r.end>oldEnd) result.push({...r,start:newEnd,end:r.end+shift});
      }
    }
    return clean(result,after.length);
  }
  return {colors,clean,paint,edit};
})();
