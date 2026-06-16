// ============================================
// RAIZ CAFÉ — Carrinho de Compras
// Preparado para integração com API/Checkout
// ============================================

const RAIZ_CART = {
  items: JSON.parse(localStorage.getItem('raiz_cart') || '[]'),

  save() {
    localStorage.setItem('raiz_cart', JSON.stringify(this.items));
  },

  add(produto) {
    const existing = this.items.find(i => i.id === produto.id);
    if (existing) {
      existing.qtd += 1;
    } else {
      this.items.push({ ...produto, qtd: 1 });
    }
    this.save();
    this.render();
    this.openDrawer();
  },

  remove(id) {
    this.items = this.items.filter(i => i.id !== id);
    this.save();
    this.render();
  },

  updateQtd(id, delta) {
    const item = this.items.find(i => i.id === id);
    if (!item) return;
    item.qtd += delta;
    if (item.qtd <= 0) this.remove(id);
    else { this.save(); this.render(); }
  },

  total() {
    return this.items.reduce((sum, i) => sum + i.preco * i.qtd, 0);
  },

  count() {
    return this.items.reduce((sum, i) => sum + i.qtd, 0);
  },

  render() {
    const count = this.count();
    const countEl = document.getElementById('cart-count');
    if (countEl) {
      countEl.textContent = count;
      countEl.classList.toggle('visible', count > 0);
    }

    const itemsEl = document.getElementById('cart-items');
    const emptyEl = document.getElementById('cart-empty');
    const totalEl = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('cart-checkout');

    if (!itemsEl) return;

    if (this.items.length === 0) {
      emptyEl && (emptyEl.style.display = 'block');
      itemsEl.innerHTML = '';
      if (totalEl) totalEl.textContent = 'R$ 0,00';
      if (checkoutBtn) checkoutBtn.disabled = true;
      return;
    }

    emptyEl && (emptyEl.style.display = 'none');
    if (checkoutBtn) checkoutBtn.disabled = false;

    itemsEl.innerHTML = this.items.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item__emoji">${item.emoji}</div>
        <div class="cart-item__info">
          <div class="cart-item__nome">${item.nome}</div>
          <div class="cart-item__preco">R$ ${(item.preco * item.qtd).toFixed(2).replace('.', ',')}</div>
          <div class="cart-item__qtd">
            <button class="qtd-btn" onclick="RAIZ_CART.updateQtd('${item.id}', -1)">−</button>
            <span>${item.qtd}</span>
            <button class="qtd-btn" onclick="RAIZ_CART.updateQtd('${item.id}', 1)">+</button>
          </div>
        </div>
        <button class="cart-item__remove" onclick="RAIZ_CART.remove('${item.id}')" title="Remover">×</button>
      </div>
    `).join('');

    if (totalEl) {
      totalEl.textContent = 'R$ ' + this.total().toFixed(2).replace('.', ',');
    }
  },

  openDrawer() {
    document.getElementById('cart-drawer')?.classList.add('open');
    document.getElementById('cart-overlay')?.classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  closeDrawer() {
    document.getElementById('cart-drawer')?.classList.remove('open');
    document.getElementById('cart-overlay')?.classList.remove('open');
    document.body.style.overflow = '';
  },

  // Preparado para integração com Mercado Pago / Stripe
  async checkout() {
    if (this.items.length === 0) return;

    const payload = {
      items: this.items.map(i => ({
        id: i.id,
        nome: i.nome,
        preco: i.preco,
        qtd: i.qtd
      })),
      total: this.total()
    };

    try {
      // TODO: substituir pela URL da API quando backend estiver pronto
      // const res = await fetch('/api/checkout', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload)
      // });
      // const data = await res.json();
      // window.location.href = data.checkoutUrl; // Mercado Pago / Stripe redirect

      alert(`Pedido recebido! Total: R$ ${this.total().toFixed(2).replace('.', ',')}\n\nIntegração com pagamento em breve.`);
    } catch (err) {
      alert('Erro ao processar pedido. Tente novamente.');
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  RAIZ_CART.render();

  document.getElementById('cart-overlay')?.addEventListener('click', () => RAIZ_CART.closeDrawer());

  // FAQ accordion
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const answer = btn.nextElementSibling;
      const isOpen = btn.classList.contains('open');
      document.querySelectorAll('.faq-question.open').forEach(b => {
        b.classList.remove('open');
        b.nextElementSibling.classList.remove('open');
      });
      if (!isOpen) {
        btn.classList.add('open');
        answer.classList.add('open');
      }
    });
  });
});
