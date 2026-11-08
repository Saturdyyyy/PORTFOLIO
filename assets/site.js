(function(){
  var C=window.SITE_CONFIG||{};
  var root=document.documentElement;
  function store(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}}
  // theme
  var btn=document.getElementById('themeToggle');
  function apply(t){root.setAttribute('data-theme',t);if(btn){btn.setAttribute('aria-label',t==='dark'?'Switch to light mode':'Switch to dark mode');btn.textContent=t==='dark'?'☀':'☾'}}
  apply(root.getAttribute('data-theme')||'dark');
  if(btn)btn.addEventListener('click',function(){var t=root.getAttribute('data-theme')==='dark'?'light':'dark';apply(t);store('theme',t)});
  // mobile nav
  var mb=document.getElementById('menuBtn'),nl=document.getElementById('navLinks');
  if(mb&&nl){mb.addEventListener('click',function(){var o=nl.classList.toggle('open');mb.setAttribute('aria-expanded',o);mb.textContent=o?'✕':'☰'});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&nl.classList.contains('open')){nl.classList.remove('open');mb.setAttribute('aria-expanded','false');mb.textContent='☰';mb.focus()}})}
  // booking links
  document.querySelectorAll('[data-book]').forEach(function(a){
    if(C.bookingUrl){a.href=C.bookingUrl;a.target='_blank';a.rel='noopener'}
    else{a.href='mailto:'+C.email+'?subject='+encodeURIComponent('Discovery call request')+'&body='+encodeURIComponent('Hi Harsh,\n\nI would like to book a discovery call.\n\nCompany / brand:\nWhat I need help with:\nPreferred days and times (IST):\n')}
  });
  // work filters
  var fb=document.querySelectorAll('.filters button');
  fb.forEach(function(b){b.addEventListener('click',function(){
    fb.forEach(function(x){x.setAttribute('aria-pressed',x===b)});
    var f=b.dataset.filter;
    document.querySelectorAll('[data-tags]').forEach(function(c){c.hidden=!(f==='all'||c.dataset.tags.split(' ').indexOf(f)>-1)});
  })});
  // contact form
  var form=document.getElementById('projectForm');
  if(form)form.addEventListener('submit',function(e){
    e.preventDefault();
    var st=document.getElementById('formStatus');
    if(!form.checkValidity()){form.reportValidity();return}
    var d=new FormData(form);
    if(C.formEndpoint){
      st.className='form-status';st.textContent='Sending…';
      fetch(C.formEndpoint,{method:'POST',body:d,headers:{Accept:'application/json'}})
       .then(function(r){if(!r.ok)throw 0;form.reset();st.className='form-status ok';st.textContent='Thanks! Your enquiry is in. Expect a reply within 1–2 working days.'})
       .catch(function(){st.className='form-status err';st.textContent='Something went wrong. Please email '+C.email+' directly.'});
    }else{
      var body='';d.forEach(function(v,k){if(k!=='consent'&&v)body+=k+': '+v+'\n'});
      location.href='mailto:'+C.email+'?subject='+encodeURIComponent('New project enquiry: '+(d.get('service')||''))+'&body='+encodeURIComponent(body);
      st.className='form-status ok';st.textContent='Your email app should open with the details filled in.';
    }
  });
  // reveal
  if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}})},{threshold:.12});document.querySelectorAll('.reveal').forEach(function(el){io.observe(el)})}
  else document.querySelectorAll('.reveal').forEach(function(el){el.classList.add('in')});
  // year
  document.querySelectorAll('[data-year]').forEach(function(el){el.textContent=new Date().getFullYear()});
  // now playing (personality only; site never depends on it)
  var np=document.getElementById('nowPlaying');
  if(np&&C.spotifyBackend&&window.fetch){
    fetch(C.spotifyBackend+'/now-playing').then(function(r){return r.json()}).then(function(d){
      if(!d||!d.trackName)return;
      np.hidden=false;np.classList.toggle('live',!!d.isPlaying);
      np.querySelector('.t').textContent=(d.isPlaying?'Now playing: ':'Last played: ')+d.trackName+' · '+d.artist;
      if(d.albumArt)np.querySelector('img').src=d.albumArt;
    }).catch(function(){});
  }
})();
