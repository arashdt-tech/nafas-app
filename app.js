const $=id=>document.getElementById(id);
const fa=n=>new Intl.NumberFormat('fa-IR').format(n);
const todayKey=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const defaults={limit:10,start:'08:00',end:'22:00',interval:90,logs:{}};
let data;try{data={...defaults,...JSON.parse(localStorage.getItem('nafasData')||'{}')};}catch{data={...defaults};}
function save(){localStorage.setItem('nafasData',JSON.stringify(data));render()}
function dayLogs(k=todayKey()){return data.logs[k]||[]}
function sum(k){return (data.logs[k]||[]).length}
function dateOffset(offset){let d=new Date();d.setDate(d.getDate()+offset);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function toast(t){$('toast').textContent=t;$('toast').style.display='block';setTimeout(()=>$('toast').style.display='none',2600)}
function render(){
 const used=sum(todayKey()),left=Math.max(0,data.limit-used);
 $('today').textContent=new Intl.DateTimeFormat('fa-IR',{weekday:'long',day:'numeric',month:'long'}).format(new Date());
 $('used').textContent=fa(used);$('limitText').textContent=fa(data.limit);$('remaining').textContent=left?`${fa(left)} نخ تا سقف روزانه باقی مانده`:'به سقف روزانه رسیدی؛ مکث کن و با آگاهی تصمیم بگیر.';
 $('leftStat').textContent=fa(left);$('progress').style.width=Math.min(100,used/data.limit*100)+'%';
 $('scheduleText').textContent=`${data.start} تا ${data.end}`;
 let week=0;for(let i=0;i<7;i++)week+=sum(dateOffset(-i));$('weekStat').textContent=fa(week);
 $('rToday').textContent=fa(used);$('rWeek').textContent=fa(week);
 let month=0;for(let i=0;i<30;i++)month+=sum(dateOffset(-i));$('rMonth').textContent=fa(month);$('rAvg').textContent=fa((month/30).toFixed(1));
 $('history').innerHTML=dayLogs().length?dayLogs().slice().reverse().map((t,i)=>`<div class="row" style="padding:9px 0;border-bottom:1px solid #314039"><span>سیگار ${fa(dayLogs().length-i)}</span><span class="muted">${new Date(t).toLocaleTimeString('fa-IR',{hour:'2-digit',minute:'2-digit'})}</span></div>`).join(''):'<div class="empty">هنوز موردی ثبت نشده است.</div>';
 const chart=$('chart');chart.innerHTML='';let vals=[];for(let i=6;i>=0;i--)vals.push({n:sum(dateOffset(-i)),label:new Intl.DateTimeFormat('fa-IR',{weekday:'short'}).format(new Date(Date.now()-i*86400000))});
 const max=Math.max(1,...vals.map(x=>x.n));vals.forEach(x=>{let el=document.createElement('div');el.className='baritem';el.innerHTML=`<div class="bar" style="height:${Math.max(3,x.n/max*88)}px"></div><span>${x.label}</span><b>${fa(x.n)}</b>`;chart.appendChild(el)});
 $('limitInput').value=data.limit;$('startInput').value=data.start;$('endInput').value=data.end;$('intervalInput').value=data.interval;
 updateReminderLabel();
}
function log(){const k=todayKey();data.logs[k]??=[];data.logs[k].push(new Date().toISOString());save();toast('مصرف ثبت شد. مراقب خودت باش.')}
$('addBtn').onclick=log;
$('undoBtn').onclick=()=>{let a=dayLogs();if(!a.length)return toast('موردی برای بازگردانی نیست.');a.pop();save();toast('آخرین ثبت بازگردانی شد.')};
$('saveSettings').onclick=()=>{let limit=Number($('limitInput').value),interval=Number($('intervalInput').value),start=$('startInput').value,end=$('endInput').value;if(!limit||limit<1||limit>99||!start||!end||!interval||interval<15)return toast('لطفاً مقادیر معتبر وارد کن.');data.limit=limit;data.start=start;data.end=end;data.interval=interval;save();toast('برنامه ذخیره شد.');};
document.querySelectorAll('.nav button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.nav button').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));$(b.dataset.tab).classList.add('active');render()});
$('craveBtn').onclick=()=>$('craveModal').classList.add('show');$('closeModal').onclick=()=>$('craveModal').classList.remove('show');$('logInstead').onclick=()=>{$('craveModal').classList.remove('show');log()};
let timer=null;function delay(min){clearInterval(timer);let end=Date.now()+min*60000;$('timerText').textContent=`${fa(min)} دقیقه مکث شروع شد`;timer=setInterval(()=>{let s=Math.max(0,Math.ceil((end-Date.now())/1000));$('timerText').textContent=`زمان باقی‌مانده: ${fa(Math.floor(s/60))}:${fa(String(s%60).padStart(2,'0'))}`;if(!s){clearInterval(timer);$('timerText').textContent='زمان مکث تمام شد؛ ببین الان چه احساسی داری.';notify('مکث تمام شد','چند لحظه به حال خودت توجه کن.')}},500)}
$('delay5').onclick=()=>delay(5);$('delay10').onclick=()=>delay(10);
async function requestNotify(){if(!('Notification'in window))return toast('این مرورگر از اعلان پشتیبانی نمی‌کند.');let p=await Notification.requestPermission();updateReminderLabel();if(p==='granted'){new Notification('NAFAS | نفس',{body:'یادآور آزمایشی؛ یک نفس عمیق بکش.'});toast('اعلان فعال شد.')}else toast('اجازه اعلان داده نشد.')}
function notify(title,body){if('Notification'in window&&Notification.permission==='granted')new Notification(title,{body})}
$('enableBtn').onclick=requestNotify;$('testNotify').onclick=requestNotify;
function updateReminderLabel(){let ok='Notification'in window&&Notification.permission==='granted';$('notifyState').textContent=ok?'اعلان مجاز است':'یادآورها خاموش';$('nextReminder').textContent=ok?`یادآورهای دوره‌ای هر ${fa(data.interval)} دقیقه، فقط تا وقتی برنامه باز و فعال است بررسی می‌شوند.`:'برای اعلان، برنامه را به صفحه اصلی اضافه کن و اجازه اعلان بده.'}
let lastReminder=0;
setInterval(()=>{if(document.visibilityState!=='visible')return;let now=new Date(),hh=now.getHours()*60+now.getMinutes(),toMin=s=>{let [h,m]=s.split(':').map(Number);return h*60+m};if(hh>=toMin(data.start)&&hh<=toMin(data.end)&&Date.now()-lastReminder>=data.interval*60000){lastReminder=Date.now();if('Notification'in window&&Notification.permission==='granted')notify('یادآوری نفس','اگر زمانش مناسب است، مصرفت را آگاهانه ثبت کن.')}},30000);
if('serviceWorker'in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
render();
