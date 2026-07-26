/* =========================================================
   ゼロハウス さいたま
   main.js
   ========================================================= */
(function () {
  'use strict';

  /* -------------------------------------------------------
     ★ お問い合わせフォームの送信先設定
     -------------------------------------------------------
     FORM_ENDPOINT が空のあいだは、送信ボタンを押すと
     お客様のメールソフトが起動する「mailto方式」で動きます。
     （静的サイトなのでサーバーがなく、これが初期状態です）

     ▼ メールアドレスの公開について（重要）
     mailto方式のあいだは、受信用アドレスがこのファイルの中に
     書かれた状態になります。ソースを表示すれば読み取れるため、
     迷惑メール収集業者に拾われる可能性があります。
     下では文字列を分割して簡易的に隠していますが、気休めです。

     アドレスを一切公開したくない場合は、
     https://formspree.io/ などで無料のフォームを作り、
     発行されたURLを FORM_ENDPOINT に貼り付けてください。
     その方式なら送信先はサービス側に保存され、
     サイトのソースには一切現れません。
       例) var FORM_ENDPOINT = 'https://formspree.io/f/xxxxxxxx';
  ------------------------------------------------------- */
  var FORM_ENDPOINT = '';
  var MAILTO_TO = ['info', 'kantojuhan.com'].join('@');

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

  var sendByMailto = function (d) {
    var body =
      'ご相談の種類：' + d.type + '\n' +
      'お名前：'       + d.name + '\n' +
      'メール：'       + d.mail + '\n' +
      '電話番号：'     + (d.tel || '（未記入）') + '\n\n' +
      'ご相談内容：\n' + d.msg + '\n';

    window.location.href =
      'mailto:' + MAILTO_TO +
      '?subject=' + encodeURIComponent('【サイトからのお問い合わせ】' + d.name + '様') +
      '&body=' + encodeURIComponent(body);

    showStatus('メールソフトを起動しました。内容をご確認のうえ送信してください。', 'ok');
  };

  var sendByFetch = function (d) {
    submit.disabled = true;
    showStatus('送信中です…', '');

    fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        'ご相談の種類': d.type,
        'お名前': d.name,
        'メールアドレス': d.mail,
        '電話番号': d.tel,
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
    var data = collect();
    if (FORM_ENDPOINT) sendByFetch(data);
    else sendByMailto(data);
  });

  $$('.f-input, #f-agree').forEach(function (el) {
    el.addEventListener('input',  function () { setError(el, ''); });
    el.addEventListener('change', function () { setError(el, ''); });
  });
})();
