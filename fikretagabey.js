const girdiAlani = document.getElementById('sorgu-kutusu');
const anaEkran = document.getElementById('ana-ekran-kapsayici');
const sohbetAkisi = document.getElementById('sohbet-akisi');
const gonderButon = document.getElementById('gonder-butonu');
const yanPanel = document.getElementById('yan-panel');
const menuBtn = document.getElementById('menu-ac');
const panelKapatBtn = document.getElementById('panel-kapat');
const yeniSohbetBtn = document.getElementById('yeni-sohbet-btn');
const gecmisListesi = document.getElementById('gecmis-listesi');
const sesButonu = document.getElementById('ses-butonu');
const dosyaInput = document.getElementById('dosya-yukle');
const resimOnizlemeDiv = document.getElementById('resim-onizleme-alani');
const secilenResimImg = document.getElementById('secilen-resim');
const resimIptalBtn = document.getElementById('resim-iptal');

const profilBtn = document.getElementById('profil-btn');
const kunyeModal = document.getElementById('kunye-modal');
const girdiModal = document.getElementById('girdi-modal');
const silModal = document.getElementById('sil-modal');
const modalInput = document.getElementById('modal-input');
const modalOnaylaBtn = document.getElementById('modal-onayla-btn');
const silOnaylaBtn = document.getElementById('sil-onayla-btn');
const girdiModalBaslik = document.getElementById('girdi-modal-baslik');
const girdiModalAciklama = document.getElementById('girdi-modal-aciklama');

let aktifSohbetId = null;
let sohbetler = JSON.parse(localStorage.getItem('fikret_arsiv')) || [];
let tanima = null;
let aktifResimBase64 = null;
let aktifModalIslemi = null;

const placeholderMetinleri = [
    "He kardeşim, derdin neyse söyle de bi bakalım.",
    "Hangi dağda kurt öldü de bana geldin?",
    "Dökül bakalım, yine ne karıştırıyorsun?",
    "Foto varsa at, göz var nizam var bakarız.",
    "Kafana takılanı sor, içinde tutma yeğenim.",
    "Hadi gardaş, ne merak ettin? Yaz hele.",
    "Çayını al gel, mevzu derin mi bakalım?"
];
let placeholderIndex = 0;

const KURAN_API = "https://api.acikkuran.com/surah";

const ayetVeritabani = {
    'faiz': { s: 2, a: 275 },
    'haram': { s: 6, a: 151 },
    'namaz': { s: 4, a: 103 },
    'zekat': { s: 9, a: 60 },
    'sabır': { s: 2, a: 153 },
    'miras': { s: 4, a: 11 },
    'adalet': { s: 16, a: 90 },
    'zina': { s: 17, a: 32 },
    'içki': { s: 5, a: 90 },
    'kumar': { s: 5, a: 90 },
    'gıybet': { s: 49, a: 12 },
    'infak': { s: 2, a: 261 }
};

window.addEventListener('DOMContentLoaded', () => {
    gecmisiYukle();
    setInterval(placeholderDegistir, 3500);
    if(window.innerWidth < 1024) yanPanel.classList.remove('acik');

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        tanima = new SpeechRecognition();
        tanima.lang = 'tr-TR';
        tanima.continuous = false;
        
        tanima.onstart = () => sesButonu.classList.add('ses-aktif');
        tanima.onend = () => sesButonu.classList.remove('ses-aktif');
        tanima.onresult = (e) => {
            girdiAlani.value = e.results[0][0].transcript;
            setTimeout(mesajGonder, 600);
        };
        sesButonu.addEventListener('click', () => tanima.start());
    } else {
        sesButonu.style.display = 'none';
    }
});

profilBtn.addEventListener('click', () => {
    kunyeModal.classList.remove('gizli');
    setTimeout(() => kunyeModal.classList.add('aktif'), 10);
});

function modalKapat(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('aktif');
    setTimeout(() => modal.classList.add('gizli'), 300);
    if(modalId === 'girdi-modal') {
        modalInput.value = '';
        aktifModalIslemi = null;
    }
}

window.addEventListener('click', (e) => {
    if(e.target === kunyeModal) modalKapat('kunye-modal');
    if(e.target === girdiModal) modalKapat('girdi-modal');
    if(e.target === silModal) modalKapat('sil-modal');
});

function modalAc(tur) {
    aktifModalIslemi = tur;
    girdiModal.classList.remove('gizli');
    setTimeout(() => girdiModal.classList.add('aktif'), 10);
    
    if (tur === 'munazara') {
        girdiModalBaslik.innerText = "Atışma Meydanı";
        girdiModalAciklama.innerText = "Hangi konuda kapışmak istiyorsun yeğenim? Yaz bakalım.";
        modalInput.placeholder = "Örn: Suçu kadere atıp tembellik yapmak caiz midir?";
    } else if (tur === 'haram') {
        girdiModalBaslik.innerText = "Neyden Şüphelendin?";
        girdiModalAciklama.innerText = "Hangi durumun sakat olduğunu düşünüyorsun?";
        modalInput.placeholder = "Örn: Alkol tüketmek, midye yemek...";
    } else if (tur === 'nedemek') {
        girdiModalBaslik.innerText = "Anlaşılmayan Mevzu";
        girdiModalAciklama.innerText = "Hangi sözün veya ayetin derin manasını merak ettin?";
        modalInput.placeholder = "Sözü veya ayeti buraya yaz...";
    }
    modalInput.focus();
}

modalOnaylaBtn.addEventListener('click', () => {
    const deger = modalInput.value.trim();
    if(!deger) return;
    
    let finalMesaj = "";
    if (aktifModalIslemi === 'munazara') {
        finalMesaj = `Seninle şu konuda münazara etmek istiyorum: ${deger}`;
    } else if (aktifModalIslemi === 'haram') {
        finalMesaj = `Şu durum haram mıdır: ${deger}`;
    } else if (aktifModalIslemi === 'nedemek') {
        finalMesaj = `Şu söz ne demek istemiş: ${deger}`;
    }
    
    modalKapat('girdi-modal');
    hizliIslem(finalMesaj);
});

modalInput.addEventListener('keypress', (e) => {
    if(e.key === 'Enter') modalOnaylaBtn.click();
});

function placeholderDegistir() {
    girdiAlani.setAttribute('placeholder', placeholderMetinleri[placeholderIndex]);
    placeholderIndex = (placeholderIndex + 1) % placeholderMetinleri.length;
}

menuBtn.addEventListener('click', () => yanPanel.classList.add('acik'));
panelKapatBtn.addEventListener('click', () => yanPanel.classList.remove('acik'));
yeniSohbetBtn.addEventListener('click', yeniSohbetBaslat);
gonderButon.addEventListener('click', mesajGonder);
girdiAlani.addEventListener('keypress', (e) => { if(e.key === 'Enter') mesajGonder(); });

resimIptalBtn.addEventListener('click', () => {
    dosyaInput.value = '';
    aktifResimBase64 = null;
    resimOnizlemeDiv.classList.add('gizli');
});

dosyaInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            aktifResimBase64 = e.target.result;
            secilenResimImg.src = aktifResimBase64;
            resimOnizlemeDiv.classList.remove('gizli');
        };
        reader.readAsDataURL(file);
    }
});

function hizliIslem(metin) {
    girdiAlani.value = metin;
    mesajGonder();
}

function yeniSohbetBaslat() {
    aktifSohbetId = Date.now().toString();
    sohbetAkisi.innerHTML = '';
    anaEkran.classList.remove('sohbet-modu');
    if(window.innerWidth < 1024) yanPanel.classList.remove('acik');
    
    const yeniKayit = {
        id: aktifSohbetId,
        baslik: "Yeni Mevzu",
        mesajlar: [],
        tarih: new Date().toLocaleDateString()
    };
    
    sohbetler.unshift(yeniKayit);
    yerelKaydet();
    gecmisiYukle();
}

function sohbetiYukle(id) {
    const sohbet = sohbetler.find(s => s.id === id);
    if (!sohbet) return;
    
    aktifSohbetId = id;
    anaEkran.classList.add('sohbet-modu');
    sohbetAkisi.innerHTML = '';
    
    sohbet.mesajlar.forEach(msg => {
        ekranaYaz(msg.icerik, msg.gonderen, msg.resim, msg.ayet, false);
    });
    
    if(window.innerWidth < 1024) yanPanel.classList.remove('acik');
    gecmisiYukle();
    asagiKaydir();
}

async function mesajGonder() {
    const metin = girdiAlani.value.trim();
    if (!metin && !aktifResimBase64) return;

    if (!aktifSohbetId) {
        yeniSohbetBaslat();
        baslikOlustur(metin);
    }

    const kullaniciMesaji = { gonderen: 'kullanici', icerik: metin, resim: aktifResimBase64 };
    mesajKaydet(kullaniciMesaji);
    ekranaYaz(metin, 'kullanici', aktifResimBase64);
    
    girdiAlani.value = '';
    const gonderilenResim = aktifResimBase64; 
    aktifResimBase64 = null;
    resimOnizlemeDiv.classList.add('gizli');
    anaEkran.classList.add('sohbet-modu');
    asagiKaydir();

    const yukleniyorId = yukleniyorGoster();
    asagiKaydir();

    try {
        const ayetVerisi = await ayetBul(metin);
        const cevapMetni = await fikretCevapla(metin, gonderilenResim, ayetVerisi);
        
        if(document.getElementById(yukleniyorId)) document.getElementById(yukleniyorId).remove();

        const asistanMesaji = { 
            gonderen: 'asistan', 
            icerik: cevapMetni, 
            ayet: ayetVerisi 
        };
        
        mesajKaydet(asistanMesaji);
        
        ekranaYaz(cevapMetni, 'asistan', null, ayetVerisi, true);
        
    } catch (hata) {
        if(document.getElementById(yukleniyorId)) document.getElementById(yukleniyorId).remove();
        ekranaYaz("Yeğenim bağlantıda bir sıkıntı var galiba. Az bekle tekrar dene.", 'asistan');
    }
}

async function baslikOlustur(ilkMesaj) {
    if(!aktifSohbetId) return;
    const prompt = `Kullanıcının şu mesajına dayanarak sohbet için çok kısa (maksimum 4 kelime) bir başlık oluştur: "${ilkMesaj}". Sadece başlığı yaz, tırnak işareti kullanma.`;
    
    try {
        const response = await fetch('https://text.pollinations.ai/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [{ role: 'user', content: prompt }],
                model: 'openai',
                jsonMode: false
            })
        });
        const baslik = await response.text();
        const sohbet = sohbetler.find(s => s.id === aktifSohbetId);
        if(sohbet) {
            sohbet.baslik = baslik.trim();
            yerelKaydet();
            gecmisiYukle();
        }
    } catch(e) { console.log("Başlık hatası"); }
}

async function fikretCevapla(soru, resimBase64, ayet) {
    let mesajlar = [];

    mesajlar.push({ 
        role: 'system', 
        content: `SEN FİKRET AĞABEYSİN.
        
        KİMLİK: Mahallenin hem fırlama hem dahi abisisin. Çok okursun ama kahve ağzıyla konuşursun. Samimisin, biraz şakacısın ama boş konuşmazsın.
        
        GÖREVİN VE KURALLARIN:
        1. ASLA "Mantıksal olarak", "Analiz ettiğimizde", "Verilere göre" gibi robotik laflar etme. Bunlar yasak.
        2. "Bak güzel kardeşim", "Oğlum şimdi şöyle", "Bana kalırsa" gibi doğal girişler yap.
        3. EĞLENCELİ OL: Araya espriler sıkıştır.
        4. Yine de bilgili ol, saçmalama. Doğruyu göster ama dikte etme.
        5. Dini konularda ayeti robot gibi okuyup geçme. "Burada Rabbimiz ne diyor biliyon mu?", "Hani derler ya..." şeklinde tefsir et.
        6. Kısa ve öz konuş, lafı dolandırma.
        
        KURAL: Görsel varsa, o görseli detaylıca, sanki yanındaymışım gibi yorumla.` 
    });

    const aktifSohbet = sohbetler.find(s => s.id === aktifSohbetId);
    if (aktifSohbet) {
        const gecmisMesajlar = aktifSohbet.mesajlar.slice(-15);
        gecmisMesajlar.forEach(msg => {
            mesajlar.push({
                role: msg.gonderen === 'kullanici' ? 'user' : 'assistant',
                content: msg.icerik
            });
        });
    }

    let userContent = [];
    if (soru) userContent.push({ type: "text", text: soru });
    else userContent.push({ type: "text", text: "Bu görseli yorumla Fikret abi." });

    if (resimBase64) {
        userContent.push({ type: "image_url", image_url: { url: resimBase64 } });
    }

    if (ayet) {
        userContent.push({ type: "text", text: `(BAĞLAM: Konuyla ilgili şu ayet var: ${ayet.ad} suresi ${ayet.no}. ayet: "${ayet.metin}". Bunu cevabına yedir, kendi üslubunla yorumla.)` });
    }

    mesajlar.push({ role: 'user', content: userContent });

    const response = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            messages: mesajlar,
            model: 'openai', 
            jsonMode: false
        })
    });

    if (!response.ok) throw new Error("API Hatası");
    return await response.text();
}

async function ayetBul(metin) {
    if(!metin) return null;
    const kucukMetin = metin.toLowerCase();
    const anahtar = Object.keys(ayetVeritabani).find(k => kucukMetin.includes(k));
    if (!anahtar) return null;
    const hedef = ayetVeritabani[anahtar];
    try {
        const res = await fetch(`${KURAN_API}/${hedef.s}`);
        const data = await res.json();
        const ayet = data.data.verses.find(v => v.verse_number === hedef.a);
        return { ad: data.data.name, no: hedef.a, metin: ayet.translation.text };
    } catch { return null; }
}

function markdownaCevir(text) {
    let html = text;
    html = html.replace(/^\s*[\-\*]\s+/gm, '- '); 
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    
    let lines = html.split('\n');
    let output = '';
    let inList = false;

    lines.forEach(line => {
        if (line.trim().startsWith('- ')) {
            if (!inList) { output += '<ul>'; inList = true; }
            output += `<li>${line.trim().substring(2)}</li>`;
        } else {
            if (inList) { output += '</ul>'; inList = false; }
            if (line.match(/^<h/)) {
                output += line;
            } else if (line.trim().length > 0) {
                output += `<p>${line}</p>`;
            }
        }
    });
    if (inList) output += '</ul>';
    return output;
}

function ekranaYaz(metin, tip, resim = null, ayet = null, streaming = false) {
    const div = document.createElement('div');
    div.className = `mesaj ${tip === 'kullanici' ? 'kullanici-mesaji' : 'asistan-mesaji'}`;
    
    if (resim) {
        const img = document.createElement('img');
        img.src = resim;
        img.className = "mesaj-resim";
        div.appendChild(img);
    }

    if (ayet && tip === 'asistan') {
        const ayetDiv = document.createElement('div');
        ayetDiv.className = 'ayet-blok';
        ayetDiv.innerHTML = `<div class="ayet-baslik">📖 ${ayet.ad} Suresi, ${ayet.no}. Ayet</div>"${ayet.metin}"`;
        sohbetAkisi.appendChild(ayetDiv); 
    }

    let formatliMetin = metin;
    if (tip === 'asistan') {
        formatliMetin = markdownaCevir(metin);
    } else {
        formatliMetin = metin.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    }

    const kopyalaBtn = document.createElement('button');
    kopyalaBtn.className = 'kopyala-btn';
    kopyalaBtn.innerHTML = '<i class="fa-regular fa-copy"></i>';
    kopyalaBtn.onclick = () => {
        navigator.clipboard.writeText(div.innerText).then(() => {
            kopyalaBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
            setTimeout(() => kopyalaBtn.innerHTML = '<i class="fa-regular fa-copy"></i>', 2000);
        });
    };
    div.appendChild(kopyalaBtn);

    if (streaming && tip === 'asistan') {
        const metinDiv = document.createElement('div');
        metinDiv.classList.add('imlec-aktif');
        div.appendChild(metinDiv);
        sohbetAkisi.appendChild(div);
        yavasYaz(metinDiv, formatliMetin);
    } else {
        const metinDiv = document.createElement('div');
        metinDiv.innerHTML = formatliMetin;
        div.appendChild(metinDiv);
        sohbetAkisi.appendChild(div);
    }
    
    if(!streaming) asagiKaydir();
}

function yavasYaz(element, htmlMetin) {
    let i = 0;
    element.innerHTML = ""; 
    let currentContent = ""; 

    function yaz() {
        if (i >= htmlMetin.length) {
            element.classList.remove('imlec-aktif');
            return;
        }

        let char = htmlMetin[i];

        if (char === '<') {
            let tag = "";
            while (htmlMetin[i] !== '>' && i < htmlMetin.length) {
                tag += htmlMetin[i];
                i++;
            }
            tag += '>'; 
            i++;
            currentContent += tag;
        } else {
            currentContent += char;
            i++;
        }

        element.innerHTML = currentContent;
        
        const threshold = 100;
        const isAtBottom = (sohbetAkisi.scrollHeight - sohbetAkisi.scrollTop - sohbetAkisi.clientHeight) < threshold;
        if (isAtBottom) asagiKaydir();
        
        setTimeout(yaz, 10); 
    }
    yaz();
}

function asagiKaydir() {
    sohbetAkisi.scrollTo({ top: sohbetAkisi.scrollHeight, behavior: 'smooth' });
}

function yukleniyorGoster() {
    const id = 'loader-' + Date.now();
    const div = document.createElement('div');
    div.id = id;
    div.className = 'mesaj asistan-mesaji';
    div.innerHTML = '<div class="yaziyor"><div class="nokta"></div><div class="nokta"></div><div class="nokta"></div></div>';
    sohbetAkisi.appendChild(div);
    return id;
}

function mesajKaydet(msg) {
    const idx = sohbetler.findIndex(s => s.id === aktifSohbetId);
    if (idx !== -1) {
        sohbetler[idx].mesajlar.push(msg);
        yerelKaydet();
    }
}

function gecmisiYukle() {
    gecmisListesi.innerHTML = '';
    sohbetler.forEach(s => {
        const div = document.createElement('div');
        div.className = `gecmis-oge ${s.id === aktifSohbetId ? 'aktif' : ''}`;
        div.onclick = () => sohbetiYukle(s.id);
        div.innerHTML = `
            <span>${s.baslik}</span>
            <button class="sil-btn" onclick="sohbetiSil('${s.id}', event)"><i class="fa-solid fa-trash"></i></button>
        `;
        gecmisListesi.appendChild(div);
    });
}

function sohbetiSil(id, e) {
    e.stopPropagation();
    sohbetler = sohbetler.filter(s => s.id !== id);
    yerelKaydet();
    if (aktifSohbetId === id) {
        aktifSohbetId = null;
        anaEkran.classList.remove('sohbet-modu');
        sohbetAkisi.innerHTML = '';
    }
    gecmisiYukle();
}

function tumGecmisiTemizle() {
    silModal.classList.remove('gizli');
    setTimeout(() => silModal.classList.add('aktif'), 10);
}

silOnaylaBtn.addEventListener('click', () => {
    sohbetler = [];
    localStorage.removeItem('fikret_arsiv');
    location.reload();
});

function yerelKaydet() {
    localStorage.setItem('fikret_arsiv', JSON.stringify(sohbetler));
}