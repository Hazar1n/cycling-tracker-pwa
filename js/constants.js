// ═══════════════════════════════════════════════════════
// DAY TEMPLATES
// ═══════════════════════════════════════════════════════
const DAY_TEMPLATES = {
  rest:      { label:'🛌 Почивка',    text:'Почивка • раздвижване + стречинг 10–15 мин', isRest:true,  color:'rest' },
  zone2:     { label:'🔵 Zone 2',     text:'Zone 2 • 150–160 W • равномерно темпо • fat burn', isRest:false, color:'zone2' },
  intervals: { label:'🟠 Интервали',  text:'Интервали • Загрявка 7 км • 4x3 мин @ 195–205 W • 3 мин леко • разпускане', isRest:false, color:'intervals' },
  tempo:     { label:'🟣 Темпо',      text:'Tempo • 170–180 W • стабилно темпо', isRest:false, color:'tempo' },
  recovery:  { label:'🟢 Възстан.',   text:'Възстановително каране • 110–130 W • много леко въртене', isRest:false, color:'recovery' },
  long:      { label:'🔴 Дълго',      text:'Дълго каране • Zone 2 • 150–160 W • издръжливост', isRest:false, color:'long' },
};

const DEFAULT_WEEK_DAYS = ['rest','zone2','intervals','recovery','tempo','long','rest'];

// ═══════════════════════════════════════════════════════
// DEFAULT PLAN
// ═══════════════════════════════════════════════════════
const DEFAULT_PLAN = {
  id: 'default-4week',
  name: '4-Седмичен план (по подразбиране)',
  isBuiltIn: true,
  weeks: [
    { title:'Седмица 1', days:[
      { type:'rest',      text:'Почивка • раздвижване + стречинг 10–15 мин', km:0 },
      { type:'zone2',     text:'30 км • Zone 2 • 150–160 W • равномерно темпо', km:30 },
      { type:'intervals', text:'25 км • Загрявка 7 км @ 140–150 W • 4x3 мин @ 190–200 W • разпускане', km:25 },
      { type:'recovery',  text:'15 км • Възстановително каране • 110–130 W', km:15 },
      { type:'tempo',     text:'25 км • Tempo • 170–180 W • стабилно темпо', km:25 },
      { type:'long',      text:'40 км • Дълго каране • Zone 2 • 150–160 W', km:40 },
      { type:'rest',      text:'Почивка • разходка 20–30 мин', km:0 },
    ]},
    { title:'Седмица 2', days:[
      { type:'rest',      text:'Почивка • раздвижване + стречинг', km:0 },
      { type:'zone2',     text:'35 км • Zone 2 • 150–160 W • steady каране', km:35 },
      { type:'intervals', text:'30 км • Загрявка 8 км • 5x3 мин @ 195–205 W • разпускане', km:30 },
      { type:'recovery',  text:'15 км • Възстановително каране • около 120 W', km:15 },
      { type:'tempo',     text:'30 км • Tempo • 170–180 W', km:30 },
      { type:'long',      text:'45 км • Дълго каране • Zone 2 • 150–160 W', km:45 },
      { type:'rest',      text:'Почивка • леко ходене', km:0 },
    ]},
    { title:'Седмица 3', days:[
      { type:'rest',      text:'Почивка • раздвижване + стречинг', km:0 },
      { type:'zone2',     text:'35 км • Zone 2 • 155–160 W', km:35 },
      { type:'intervals', text:'30 км • Загрявка 8 км • 4x4 мин @ 195–205 W • разпускане', km:30 },
      { type:'recovery',  text:'20 км • Възстановително каране • 110–125 W', km:20 },
      { type:'tempo',     text:'30 км • Tempo • 175–185 W', km:30 },
      { type:'long',      text:'50 км • Дълго каране • Zone 2 • 150–160 W', km:50 },
      { type:'rest',      text:'Почивка • walk + стречинг', km:0 },
    ]},
    { title:'Седмица 4 (разтоварваща)', days:[
      { type:'rest',      text:'Почивка • възстановяване', km:0 },
      { type:'zone2',     text:'25 км • Easy Zone 2 • 150–155 W', km:25 },
      { type:'intervals', text:'20 км • Загрявка 5 км • 3x3 мин @ 190 W • разпускане', km:20 },
      { type:'rest',      text:'Почивка • раздвижване + стречинг', km:0 },
      { type:'recovery',  text:'20 км • Easy • 120–130 W', km:20 },
      { type:'long',      text:'35 км • Леко дълго каране • около 150 W', km:35 },
      { type:'rest',      text:'Пълна почивка', km:0 },
    ]},
  ]
};
