// 1. إعدادات Firebase الخاصة بمشروعك (laflafeta)
const firebaseConfig = {
  apiKey: "AIzaSyAoqR1UqFt0MT7dxFtjNCkZB3W-6NVaf7A",
  authDomain: "laflafeta.firebaseapp.com",
  databaseURL: "https://laflafeta-default-rtdb.firebaseio.com", // تأكد من تفعيل الـ Database
  projectId: "laflafeta",
  storageBucket: "laflafeta.firebasestorage.app",
  messagingSenderId: "878138717919",
  appId: "1:878138717919:web:74c9c0e694888eb1465b6a"
};

// تشغيل Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const storage = firebase.storage();

// الباسورد الخاص بالأدمن
const MY_PASSWORD = "lavalvita_boss"; 

// --- وظائف صفحة اليوزر (index.html) ---

function renderProducts(category = 'الكل') {
    const display = document.getElementById('product-display');
    if(!display) return;

    db.ref('products').on('value', (snapshot) => {
        display.innerHTML = '';
        const data = snapshot.val();
        if(!data) {
            display.innerHTML = `<div class="no-data">قريباً.. منتجات جديدة في لافلفيتا ✨</div>`;
            return;
        }

        Object.keys(data).forEach(id => {
            const p = data[id];
            if(category === 'الكل' || p.category === category) {
                display.innerHTML += `
                    <div class="product-card">
                        <img src="${p.img}" alt="${p.name}">
                        <h3>${p.name}</h3>
                        <p>${p.desc}</p>
                        <span class="price">${p.price} ج.م</span>
                        <button class="add-btn" onclick="addToCart('${id}', '${p.name}', ${p.price})">أضف للسلة 🛒</button>
                    </div>
                `;
            }
        });
    });
}

let cart = JSON.parse(localStorage.getItem('lavelvita_cart')) || [];
function addToCart(id, name, price) {
    cart.push({id, name, price});
    updateCartUI();
    alert(`تم إضافة ${name} للسلة 🎀`);
}

function updateCartUI() {
    const count = document.getElementById('cart-count');
    if(count) count.innerText = cart.length;
    localStorage.setItem('lavelvita_cart', JSON.stringify(cart));
}

function submitOrder() {
    const name = document.getElementById('cust-name').value;
    const address = document.getElementById('cust-address').value;
    const city = document.getElementById('cust-city').value;

    if (!name || !address || cart.length === 0) {
        alert("أكملي البيانات يا قمر 🌸");
        return;
    }

    const orderData = {
        customer: { name, address, city },
        items: cart,
        total: cart.reduce((sum, i) => sum + i.price, 0),
        date: new Date().toLocaleString('ar-EG'),
        status: "نشط ✨"
    };

    db.ref('orders').push(orderData).then(() => {
        alert(`شكراً يا ${name}! أوردرك وصل لافلفيتا 🎀`);
        cart = [];
        updateCartUI();
        location.reload();
    });
}

// --- وظائف صفحة الأدمن (admin.html) ---

function checkLogin() {
    const enteredPass = document.getElementById('admin-pass').value;
    const errorMsg = document.getElementById('login-error');
    if (enteredPass === MY_PASSWORD) {
        document.getElementById('login-overlay').style.display = "none";
        sessionStorage.setItem('isAdmin', 'true');
        loadAdminData();
    } else {
        errorMsg.style.display = "block";
    }
}

function saveNewProduct() {
    const name = document.getElementById('p-name').value;
    const price = document.getElementById('p-price').value;
    const cat = document.getElementById('p-cat').value;
    const desc = document.getElementById('p-desc').value;
    const imageFile = document.getElementById('p-image-file').files[0];

    if (!name || !price || !imageFile) return alert("أكمل البيانات وارفع صورة المنتج 📸");

    const storageRef = storage.ref('products/' + Date.now() + "_" + imageFile.name);
    
    // رفع الصورة أولاً
    storageRef.put(imageFile).then((snapshot) => {
        snapshot.ref.getDownloadURL().then((url) => {
            // حفظ المنتج في الداتا بيز
            db.ref('products').push({
                name, price: parseFloat(price), category: cat, desc, img: url
            }).then(() => {
                alert("تم النشر على السيرفر بنجاح! 🎀");
                location.reload();
            });
        });
    });
}

function loadAdminData() {
    db.ref('orders').on('value', (snapshot) => {
        const orders = snapshot.val();
        const activeList = document.getElementById('orders-list');
        const historyList = document.getElementById('history-list');
        if(!activeList) return;

        activeList.innerHTML = '';
        if(historyList) historyList.innerHTML = '';
        
        let activeCount = 0;
        let totalSales = 0;

        if(orders) {
            Object.keys(orders).forEach(id => {
                const o = orders[id];
                const card = createOrderCard(id, o);
                if(o.status !== "مكتمل ✅") {
                    activeList.innerHTML = card + activeList.innerHTML;
                    activeCount++;
                } else {
                    if(historyList) historyList.innerHTML = card + historyList.innerHTML;
                    totalSales += o.total;
                }
            });
        }
        document.getElementById('stat-total').innerText = totalSales + " ج.م";
        document.getElementById('stat-active-count').innerText = activeCount;
    });
}

function finishOrder(orderId) {
    db.ref('orders/' + orderId).update({ status: "مكتمل ✅" });
}

function createOrderCard(id, order) {
    const isActive = order.status !== "مكتمل ✅";
    return `
        <div class="order-card">
            <div class="order-header"><b>#${id.slice(-5)}</b> <span>${order.date}</span></div>
            <p>👤 ${order.customer.name} | 📍 ${order.customer.city}</p>
            <p>🏠 ${order.customer.address}</p>
            <div style="background:#fff; padding:10px; border-radius:10px; font-size:0.9rem; border: 1px solid #ffebee;">
                ${order.items.map(i => `• ${i.name}`).join('<br>')}
            </div>
            <b>الإجمالي: ${order.total} ج.م</b>
            ${isActive ? `<button class="finish-btn" onclick="finishOrder('${id}')">تم الشحن ✅</button>` : ''}
        </div>
    `;
}

window.onload = () => {
    if(document.getElementById('product-display')) renderProducts('الكل');
    if(sessionStorage.getItem('isAdmin') === 'true') {
        if(document.getElementById('login-overlay')) document.getElementById('login-overlay').style.display = "none";
        loadAdminData();
    }
};