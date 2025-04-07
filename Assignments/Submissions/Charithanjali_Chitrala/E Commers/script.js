document.addEventListener('DOMContentLoaded', function() {
    const productsGrid = document.getElementById('productsGrid');
    const cartBtn = document.getElementById('cartBtn');
    const closeCart = document.getElementById('closeCart');
    const cartSidebar = document.getElementById('cartSidebar');
    const cartItems = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const cartTotal = document.getElementById('cartTotal');
    const overlay = document.getElementById('overlay');
    const checkoutBtn = document.getElementById('checkoutBtn');
    let products = [];
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    async function fetchProducts() {
        try {
            const response = await fetch('https://fakestoreapi.com/products');
            products = await response.json();
            renderProducts();
        } catch (error) {
            console.error('Error fetching products:', error);
            productsGrid.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <p class="text-red-500">Failed to load products. Please try again later.</p>
                </div>
            `;
        }
    }
    function renderProducts() {
        if (products.length === 0) {
            productsGrid.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <p>No products available</p>
                </div>
            `;
            return;
        }

        productsGrid.innerHTML = products.map(product => `
            <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div class="h-48 bg-gray-100 flex items-center justify-center p-4">
                    <img src="${product.image}" alt="${product.title}" class="max-h-full max-w-full object-contain">
                </div>
                <div class="p-4">
                    <h3 class="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">${product.title}</h3>
                    <div class="flex items-center mb-2">
                        <div class="text-yellow-400 mr-1">
                            ${renderStars(product.rating.rate)}
                        </div>
                        <span class="text-gray-500 text-sm">(${product.rating.count})</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-xl font-bold text-indigo-600">$${product.price.toFixed(2)}</span>
                        <button class="add-to-cart bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition" data-id="${product.id}">
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                addToCart(productId);
            });
        });
    }
    function renderStars(rate) {
        const fullStars = Math.floor(rate);
        const halfStar = rate % 1 >= 0.5 ? 1 : 0;
        const emptyStars = 5 - fullStars - halfStar;
        
        let stars = '';
        stars += '<i class="fas fa-star"></i>'.repeat(fullStars);
        if (halfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        stars += '<i class="far fa-star"></i>'.repeat(emptyStars);
        
        return stars;
    }
    function addToCart(productId) {
        const product = products.find(p => p.id === productId);
        
        if (!product) return;
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                title: product.title,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }
        
        updateCart();
        const button = document.querySelector(`.add-to-cart[data-id="${productId}"]`);
        button.textContent = 'Added!';
        button.classList.remove('bg-indigo-600', 'hover:bg-indigo-700');
        button.classList.add('bg-green-500', 'hover:bg-green-600');
        
        setTimeout(() => {
            button.textContent = 'Add to Cart';
            button.classList.remove('bg-green-500', 'hover:bg-green-600');
            button.classList.add('bg-indigo-600', 'hover:bg-indigo-700');
        }, 1000);
    }
    function updateCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
        if (cart.length === 0) {
            cartItems.innerHTML = `
                <div class="h-full flex flex-col items-center justify-center text-gray-400">
                    <i class="fas fa-shopping-cart text-5xl mb-4"></i>
                    <p class="text-lg font-medium">Your cart is empty</p>
                    <p class="text-sm">Start shopping to add items</p>
                </div>
            `;
            cartTotal.textContent = '$0.00';
            checkoutBtn.disabled = true;
            return;
        }
        
        checkoutBtn.disabled = false;
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item flex mb-4 pb-4 border-b" data-id="${item.id}">
                <div class="w-20 h-20 bg-gray-100 flex-shrink-0 mr-4 flex items-center justify-center rounded">
                    <img src="${item.image}" alt="${item.title}" class="max-h-full max-w-full object-contain">
                </div>
                <div class="flex-1">
                    <h4 class="font-medium text-gray-800 line-clamp-2">${item.title}</h4>
                    <p class="text-indigo-600 font-bold">$${item.price.toFixed(2)}</p>
                    <div class="flex items-center mt-2">
                        <button class="quantity-btn minus w-7 h-7 bg-gray-200 rounded flex items-center justify-center">
                            <i class="fas fa-minus text-xs"></i>
                        </button>
                        <input type="number" class="quantity-input w-12 text-center mx-2 border rounded" value="${item.quantity}" min="1">
                        <button class="quantity-btn plus w-7 h-7 bg-gray-200 rounded flex items-center justify-center">
                            <i class="fas fa-plus text-xs"></i>
                        </button>
                        <button class="remove-item ml-auto text-red-500 hover:text-red-700">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = `$${total.toFixed(2)}`;
        document.querySelectorAll('.quantity-btn').forEach(button => {
            button.addEventListener('click', function() {
                const cartItem = this.closest('.cart-item');
                const productId = parseInt(cartItem.getAttribute('data-id'));
                const input = cartItem.querySelector('.quantity-input');
                
                if (this.classList.contains('plus')) {
                    input.value = parseInt(input.value) + 1;
                } else if (this.classList.contains('minus')) {
                    if (input.value > 1) {
                        input.value = parseInt(input.value) - 1;
                    }
                }
                
                updateCartItem(productId, parseInt(input.value));
            });
        });
        document.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', function() {
                const cartItem = this.closest('.cart-item');
                const productId = parseInt(cartItem.getAttribute('data-id'));
                const value = parseInt(this.value) || 1;
                this.value = value; 
                
                updateCartItem(productId, value);
            });
        });
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', function() {
                const cartItem = this.closest('.cart-item');
                const productId = parseInt(cartItem.getAttribute('data-id'));
                
                removeFromCart(productId);
            });
        });
    }
    function updateCartItem(productId, quantity) {
        const item = cart.find(item => item.id === productId);
        
        if (item) {
            item.quantity = quantity;
            updateCart();
        }
    }
    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        updateCart();
    }
    function toggleCart() {
        cartSidebar.classList.toggle('translate-x-full');
        overlay.classList.toggle('opacity-0');
        overlay.classList.toggle('pointer-events-none');
        document.body.classList.toggle('overflow-hidden');
    }
    cartBtn.addEventListener('click', toggleCart);
    closeCart.addEventListener('click', toggleCart);
    overlay.addEventListener('click', toggleCart);
    
    checkoutBtn.addEventListener('click', function() {
        if (cart.length === 0) return;
        alert('Checkout functionality would be implemented here!\nTotal: ' + cartTotal.textContent);
    });
    fetchProducts();
    updateCart();
});