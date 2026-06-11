import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, setDoc, onSnapshot, collection, addDoc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA8XIuG2hYT7j4U4eqJsjchNjrX10GQVo8",
  authDomain: "jadiin-project-f6d1b.firebaseapp.com",
  projectId: "jadiin-project-f6d1b",
  databaseURL: "https://jadiin-project-f6d1b-default-rtdb.asia-southeast1.firebasedatabase.app/"
  storageBucket: "jadiin-project-f6d1b.firebasestorage.app",
  messagingSenderId: "358470574404",
  appId: "1:358470574404:web:bd8f9d6d8644a9a7547711"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let currentEditId = null;

function cleanUrl(rawUrl) {
    if (!rawUrl) return "";
    let clean = rawUrl.trim();
    if (clean.includes('src=')) {
        const match = clean.match(/src="([^"]+)"/);
        clean = match ? match[1] : clean;
    }
    if (clean.includes('drive.google.com/file/d/')) {
        const match = clean.match(/\/d\/([^\/]+)/);
        if (match && match[1]) {
            return `http://googleusercontent.com/profile/picture/${match[1]}`;
        }
    }
    return clean;
}   

// ==========================================
// FIX & ENHANCE: SLIDER MOUSE DRAG + BUTTON NAVIGATION
// ==========================================
function setupSliderControls(sliderId, prevBtnId, nextBtnId) {
    const slider = document.getElementById(sliderId);
    const prevBtn = document.getElementById(prevBtnId);
    const nextBtn = document.getElementById(nextBtnId);
    
    if (!slider) return;

    if (prevBtn && nextBtn) {
        const scrollAmount = 340; 
        prevBtn.addEventListener('click', () => {
            slider.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });
        nextBtn.addEventListener('click', () => {
            slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });
    }

    let isDown = false;
    let startX;
    let scrollLeft;

    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        slider.style.scrollBehavior = 'auto'; 
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });

    slider.addEventListener('mouseleave', () => {
        isDown = false;
    });

    slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.style.scrollBehavior = 'smooth'; 
    });

    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 2; 
        slider.scrollLeft = scrollLeft - walk;
    });
}

document.addEventListener("DOMContentLoaded", () => {
    setupSliderControls('gallerySlider', 'prevGallery', 'nextGallery');
    setupSliderControls('reviewSliderContainer', 'prevReview', 'nextReview');
});

// ==========================================
// 1. DISTRIBUSI REALTIME DATABASE KE INDEX
// ==========================================
if (document.getElementById('displayAboutUs')) {
    
    onSnapshot(doc(db, "web", "content"), (snap) => {
        if (snap.exists()) {
            const d = snap.data();
            
            if (document.getElementById('displayHeroTitle')) document.getElementById('displayHeroTitle').innerText = d.heroTitle || "JADIIN.CO";
            if (document.getElementById('displayAboutUs')) document.getElementById('displayAboutUs').innerText = d.aboutUs || "";
            if (document.getElementById('displayVision')) document.getElementById('displayVision').innerText = d.vision || "";
            if (document.getElementById('displayAddress')) document.getElementById('displayAddress').innerText = d.address || "";
            
            const missionBox = document.getElementById('displayMission');
            if (missionBox) {
                if (d.mission) {
                    const lines = d.mission.split('\n').filter(l => l.trim() !== "");
                    missionBox.innerHTML = lines.map(l => `<p>• ${l}</p>`).join('');
                } else { missionBox.innerHTML = ""; }
            }
            
            if (document.getElementById('displayHeroImg')) document.getElementById('displayHeroImg').src = cleanUrl(d.heroImg);
            if (document.getElementById('displayMap')) document.getElementById('displayMap').src = cleanUrl(d.mapUrl);
            
            const wa = `https://wa.me/${d.phone || '62812345678'}`;
            if (document.getElementById('waTopLink')) document.getElementById('waTopLink').href = wa;
            if (document.getElementById('floatWA')) document.getElementById('floatWA').href = wa;
            if (document.getElementById('igLink')) document.getElementById('igLink').href = d.ig || "#";
            if (document.getElementById('ytLink')) document.getElementById('ytLink').href = d.yt || "#";
            if (document.getElementById('shopeeLink')) document.getElementById('shopeeLink').href = d.shopee || "#";
            if (document.getElementById('tokopediaLink')) document.getElementById('tokopediaLink').href = d.tokped || "#";
        }
    });

    onSnapshot(collection(db, "items"), (snap) => {
        const pGrid = document.getElementById('projectGrid');
        const prGrid = document.getElementById('readyProductGrid'); 
        const galSlider = document.getElementById('gallerySlider');
        const rRowUtuh = document.getElementById('reviewRowUtuh'); 
        
        if (pGrid) pGrid.innerHTML = ""; 
        if (prGrid) prGrid.innerHTML = "";
        if (galSlider) galSlider.innerHTML = "";
        if (rRowUtuh) rRowUtuh.innerHTML = "";
        
        snap.forEach((doc) => {
            const itm = doc.data();
            const imgUrl = cleanUrl(itm.val);
            
            // Kategori 1: Selected Projects
            if (itm.type === 'project' && pGrid) {
                pGrid.innerHTML += `
                    <div class="rounded-3xl overflow-hidden shadow-lg border-4 border-white bg-white" data-aos="fade-up">
                        <img src="${imgUrl}" class="w-full h-80 object-cover">
                        <h4 class="p-6 font-black uppercase italic text-stone-800">${itm.title}</h4>
                    </div>`;
            
            // Kategori 2: Ready Products (UPDATE: Disesuaikan dengan tema background bg-stone-900 index.html)
            } else if (itm.type === 'product' && prGrid) {
                prGrid.innerHTML += `
                    <div class="bg-stone-800 p-5 rounded-[40px] border border-stone-700 shadow-md transition duration-300 hover:scale-[1.03]" data-aos="zoom-in">
                        <img src="${imgUrl}" class="w-full h-40 object-cover rounded-3xl mb-4">
                        <h4 class="text-center font-black uppercase text-[10px] tracking-widest text-white">${itm.title}</h4>
                    </div>`;
            
            // Kategori 3: Gallery Project
            } else if (itm.type === 'gallery' && galSlider) {
                galSlider.innerHTML += `
                    <div class="w-80 md:w-96 shrink-0 bg-white p-4 rounded-3xl border border-stone-100 shadow-md">
                        <img src="${imgUrl}" class="w-full h-56 object-cover rounded-2xl mb-4">
                        <h5 class="font-black text-sm uppercase text-stone-900 tracking-wider mb-1 whitespace-normal">${itm.title}</h5>
                        <p class="text-[11px] text-stone-500 font-medium whitespace-normal leading-relaxed">${itm.extra || ''}</p>
                    </div>`;

            // Kategori 4: Client Reviews
            } else if (itm.type === 'review' && rRowUtuh) {
                rRowUtuh.innerHTML += `
                    <div class="w-[300px] md:w-[380px] bg-stone-50 p-6 md:p-8 rounded-[35px] border border-stone-100 shadow-sm flex flex-col justify-between">
                        <div>
                            <div class="flex text-amber-400 text-xs gap-1 mb-4">
                                <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
                            </div>
                            <p class="text-stone-600 font-medium italic text-xs md:text-sm leading-relaxed mb-6">"${itm.extra || ''}"</p>
                        </div>
                        <div class="flex items-center space-x-3 border-t border-stone-200/60 pt-4">
                            <img src="${imgUrl}" class="w-10 h-10 rounded-full object-cover border border-stone-200 bg-stone-100 shrink-0">
                            <div>
                                <h5 class="font-black text-xs uppercase text-stone-800 tracking-wide">${itm.title}</h5>
                                <span class="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Verified Client</span>
                            </div>
                        </div>
                    </div>`;
            }
        });
    });
}

// ==========================================
// 2. SISTEM OPERASI CONTROL PANEL (ADMIN)
// ==========================================
if (document.getElementById('btnSaveInfo')) {
    onSnapshot(doc(db, "web", "content"), (snap) => {
        if (snap.exists()) {
            const d = snap.data();
            document.getElementById('inputHeroTitle').value = d.heroTitle || "";
            document.getElementById('inputAboutUs').value = d.aboutUs || "";
            document.getElementById('inputVision').value = d.vision || "";
            document.getElementById('inputMission').value = d.mission || "";
            document.getElementById('inputAddress').value = d.address || "";
            document.getElementById('inputMap').value = d.mapUrl || "";
            document.getElementById('inputPhone').value = d.phone || "";
            document.getElementById('inputTokped').value = d.tokped || "";
            document.getElementById('inputShopee').value = d.shopee || "";
            document.getElementById('inputIG').value = d.ig || "";
            document.getElementById('inputYT').value = d.yt || "";
            document.getElementById('inputHeroImg').value = d.heroImg || "";
        }
    });

    document.getElementById('btnSaveInfo').onclick = async () => {
        try {
            await setDoc(doc(db, "web", "content"), {
                heroTitle: document.getElementById('inputHeroTitle').value,
                aboutUs: document.getElementById('inputAboutUs').value,
                vision: document.getElementById('inputVision').value,
                mission: document.getElementById('inputMission').value,
                address: document.getElementById('inputAddress').value,
                mapUrl: cleanUrl(document.getElementById('inputMap').value), 
                phone: document.getElementById('inputPhone').value,
                tokped: document.getElementById('inputTokped').value,
                shopee: document.getElementById('inputShopee').value,
                ig: document.getElementById('inputIG').value,
                yt: document.getElementById('inputYT').value,
                heroImg: cleanUrl(document.getElementById('inputHeroImg').value) 
            });
            alert("UPDATE BERHASIL & LINK DIBERSIHKAN OTOMATIS!");
        } catch (e) { alert("Gagal menyimpan: " + e.message); }
    };

    document.getElementById('btnAddItem').onclick = async () => {
        const title = document.getElementById('itemTitle').value;
        const val = cleanUrl(document.getElementById('itemVal').value); 
        const type = document.getElementById('itemType').value;
        const extra = document.getElementById('itemExtra') ? document.getElementById('itemExtra').value : "";

        if (!title || !val) return alert("Harap isi Judul/Nama dan Gambar item!");

        try {
            if (currentEditId) {
                await updateDoc(doc(db, "items", currentEditId), {
                    type,
                    title,
                    val,
                    extra: extra || ""
                });
                alert("ITEM BERHASIL DIPERBARUI!");
                resetItemForm();
            } else {
                await addDoc(collection(db, "items"), { 
                    type, 
                    title, 
                    val, 
                    extra: extra || "", 
                    createdAt: new Date() 
                });
                alert("ITEM BERHASIL DITAMBAHKAN!");
                resetItemForm();
            }
        } catch (e) { alert("Gagal memproses item: " + e.message); }
    };

    function resetItemForm() {
        currentEditId = null;
        document.getElementById('itemType').disabled = false;
        document.getElementById('itemTitle').value = "";
        document.getElementById('itemVal').value = "";
        if (document.getElementById('itemExtra')) document.getElementById('itemExtra').value = "";
        
        document.getElementById('formFormTitle').innerText = "Tambah Item Baru";
        document.getElementById('formIcon').innerHTML = `<i class="fas fa-plus text-xs"></i>`;
        document.getElementById('btnAddItem').innerHTML = `<i class="fas fa-plus-circle mr-1"></i> Tambahkan Data Item`;
        if (document.getElementById('btnCancelEdit')) document.getElementById('btnCancelEdit').classList.add('hidden');
    }

    if (document.getElementById('btnCancelEdit')) {
        document.getElementById('btnCancelEdit').onclick = () => { resetItemForm(); };
    }

    onSnapshot(collection(db, "items"), (snap) => {
        const manager = document.getElementById('dataManager');
        if (manager) {
            manager.innerHTML = "";
            snap.forEach((docSnap) => {
                const itm = docSnap.data();
                const safeData = JSON.stringify({
                    id: docSnap.id,
                    title: itm.title || "",
                    val: itm.val || "",
                    type: itm.type || "",
                    extra: itm.extra || ""
                }).replace(/"/g, '&quot;');

                manager.innerHTML += `
                    <div class="bg-white p-3 rounded-xl border flex justify-between items-center mb-2 shadow-sm">
                        <div class="flex flex-col">
                            <span class="text-xs font-bold uppercase text-stone-700">${itm.title}</span>
                            <span class="text-[10px] text-pink-500 font-semibold uppercase tracking-wider">${itm.type}</span>
                        </div>
                        <div class="flex space-x-1">
                            <button onclick="triggerEditItem('${safeData}')" class="text-blue-500 hover:text-blue-700 font-black text-xs px-2 py-1">EDIT</button>
                            <button onclick="deleteItem('${docSnap.id}')" class="text-red-500 hover:text-red-700 font-black text-xs px-2 py-1">HAPUS</button>
                        </div>
                    </div>`;
            });
        }
    });

    window.triggerEditItem = (jsonString) => {
        const data = JSON.parse(jsonString.replace(/&quot;/g, '"'));
        currentEditId = data.id;

        document.getElementById('itemType').value = data.type;
        document.getElementById('itemType').dispatchEvent(new Event('change')); 
        document.getElementById('itemType').disabled = true; 
        
        document.getElementById('itemTitle').value = data.title;
        document.getElementById('itemVal').value = data.val; 
        if (document.getElementById('itemExtra')) {
            document.getElementById('itemExtra').value = data.extra;
        }

        document.getElementById('formFormTitle').innerText = "Edit/Ganti Gambar Item";
        document.getElementById('formIcon').innerHTML = `<i class="fas fa-edit text-xs"></i>`;
        document.getElementById('btnAddItem').innerHTML = `<i class="fas fa-save mr-1"></i> Simpan Perubahan`;
        if (document.getElementById('btnCancelEdit')) document.getElementById('btnCancelEdit').classList.remove('hidden');
    };

    window.deleteItem = async (id) => {
        if (confirm("Hapus item secara permanen?")) {
            await deleteDoc(doc(db, "items", id));
            if(currentEditId === id) resetItemForm();
        }
    };
}
