/* =========================================================
   ゼロハウス さいたま
   main.js
   ========================================================= */
(function () {
  'use strict';

  /* -------------------------------------------------------
     ★ お問い合わせフォームの送信先
     -------------------------------------------------------
     Formspree を使用しています。
     実際の受信メールアドレスは Formspree 側に保存されており、
     このファイルにもサイトのソースにも一切含まれません。

     受信先を変更する場合は、Formspree の管理画面
     （https://formspree.io/forms）で
     該当フォームの Settings → Emails から変更してください。
     このファイルを書き換える必要はありません。

     無料プランの上限は月50件です。
  ------------------------------------------------------- */
  var FORM_ENDPOINT = 'https://formspree.io/f/xpqvogwy';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ------------------------- 西暦（フッター） ------------------------- */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ------------------------- モバイルメニュー ------------------------- */
  var burger = $('#hamburger');
  var links  = $('#navLinks');

  if (burger && links) {
    var setMenu = function (open) {
      burger.classList.toggle('is-open', open);
      links.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    };
    burger.addEventListener('click', function () {
      setMenu(!links.classList.contains('is-open'));
    });
    $$('a', links).forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });
  }

  /* ------------------------- FAQ アコーディオン ------------------------- */
  $$('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq-item');
      var open = !item.classList.contains('is-open');
      item.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
  });

  /* ------------------------- 条件セレクト → フォームへ反映 ------------------------- */
  var searchBtn = $('#searchBtn');
  if (searchBtn) {
    searchBtn.addEventListener('click', function () {
      var area   = $('#sArea').value;
      var price  = $('#sPrice').value;
      var madori = $('#sMadori').value;
      var option = $('#sOption').value;

      var parts = [];
      if (area)   parts.push('エリア：' + area);
      if (price)  parts.push('価格帯：' + price);
      if (madori) parts.push('間取り：' + madori);
      if (option) parts.push('こだわり：' + option);

      var msg = $('#f-msg');
      var type = $('#f-type');

      if (parts.length) {
        var text = '下記の条件で新築一戸建てを探しています。\n\n' + parts.join('\n') + '\n\n';
        // すでに入力済みの内容は消さずに、条件だけ先頭に追加
        msg.value = msg.value.trim() ? text + msg.value.trim() : text;
        if (!type.value) type.value = '新築一戸建てを探している';
      }

      $('#contact').scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(function () { msg.focus({ preventScroll: true }); }, 450);
    });
  }

  /* ------------------------- お問い合わせフォーム ------------------------- */
  var form = $('#contactForm');
  if (!form) return;

  var status = $('#formStatus');
  var submit = $('#submitBtn');

  var setError = function (input, message) {
    var row = input.closest('.f-row-half') ? input.parentElement : input.closest('.f-row');
    var err = row ? row.querySelector('[data-err]') : null;
    if (input.type !== 'checkbox') input.classList.toggle('is-error', !!message);
    if (err) {
      err.textContent = message || '';
      err.classList.toggle('is-shown', !!message);
    }
  };

  var validate = function () {
    var ok = true;
    var first = null;

    var rules = [
      { el: $('#f-type'),  msg: 'ご相談の種類を選択してください。' },
      { el: $('#f-name'),  msg: 'お名前をご入力ください。' },
      { el: $('#f-mail'),  msg: 'メールアドレスをご入力ください。' },
      { el: $('#f-msg'),   msg: 'ご相談内容をご入力ください。' },
      { el: $('#f-agree'), msg: '個人情報の取扱いへの同意が必要です。' }
    ];

    rules.forEach(function (r) {
      if (!r.el) return;
      var empty = r.el.type === 'checkbox' ? !r.el.checked : !r.el.value.trim();
      if (empty) {
        setError(r.el, r.msg);
        ok = false;
        if (!first) first = r.el;
      } else {
        setError(r.el, '');
      }
    });

    var mail = $('#f-mail');
    if (mail && mail.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail.value.trim())) {
      setError(mail, 'メールアドレスの形式をご確認ください。');
      ok = false;
      if (!first) first = mail;
    }

    var tel = $('#f-tel');
    if (tel && tel.value.trim() && !/^[0-9+\-() ]{9,20}$/.test(tel.value.trim())) {
      setError(tel, '電話番号は数字とハイフンでご入力ください。');
      ok = false;
      if (!first) first = tel;
    }

    if (first) {
      first.focus({ preventScroll: true });
      first.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return ok;
  };

  var showStatus = function (text, kind) {
    if (!status) return;
    status.textContent = text;
    status.className = 'f-status' + (kind ? ' is-' + kind : '');
  };

  var collect = function () {
    return {
      type: $('#f-type').value,
      name: $('#f-name').value.trim(),
      mail: $('#f-mail').value.trim(),
      tel:  $('#f-tel').value.trim(),
      msg:  $('#f-msg').value.trim()
    };
  };

  var sendByFetch = function (d) {
    submit.disabled = true;
    showStatus('送信中です…', '');

    fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // _subject と email は Formspree の予約フィールドです。
        // email を渡しておくと、届いたメールでそのまま「返信」を押すだけで
        // お客様宛に返信できます。
        _subject: '【サイトからのお問い合わせ】' + d.name + '様',
        email: d.mail,
        'ご相談の種類': d.type,
        'お名前': d.name,
        'メールアドレス': d.mail,
        '電話番号': d.tel || '（未記入）',
        'ご相談内容': d.msg
      })
    })
      .then(function (res) {
        if (!res.ok) throw new Error('status ' + res.status);
        form.reset();
        showStatus('送信が完了しました。1〜2営業日以内にご返信いたします。', 'ok');
      })
      .catch(function () {
        showStatus('送信に失敗しました。お手数ですが 048-606-3306 までお電話ください。', 'ng');
      })
      .then(function () { submit.disabled = false; });
  };

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    showStatus('', '');
    if (!validate()) {
      showStatus('未入力の項目があります。ご確認ください。', 'ng');
      return;
    }
    sendByFetch(collect());
  });

  $$('.f-input, #f-agree').forEach(function (el) {
    el.addEventListener('input',  function () { setError(el, ''); });
    el.addEventListener('change', function () { setError(el, ''); });
  });
})();
