// ==UserScript==
// @name         Underground Schoology
// @namespace    https://orbiit.github.io/
// @version      pre-1.1.16
// @description  A second social media on top of Schoology
// @author       Anti-SELF revolutionaries
// @match        https://pausd.schoology.com/home
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  const STORAGE_KEY = '[us] userID pre-1.1';
  const UG_CSS_PFX = 'underground-st';
  const UG_ATTR_PFX = 'data-ugs-st';
  const UG_ATTR_JS_PFX = 'ugsSt';

  const styles = document.createElement('style');
  styles.innerHTML = `
  [${UG_ATTR_PFX}-user] {
    position: relative;
  }
  .${UG_CSS_PFX}-user-card {
    position: absolute;
    white-space: nowrap;
    background: #fff;
    padding: 15px;
    border: 1px solid #444;
    z-index: 2100;
    box-shadow: 0 2px 2px rgba(0, 0, 0, 0.2);
    font-weight: normal;
    color: #333;
    left: 0;
  }
  .${UG_CSS_PFX}-id {
    font-family: monospace;
    font-size: 8px;
  }
  .${UG_CSS_PFX}-pfp {
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
  }
  .${UG_CSS_PFX}-post-pfp {
    width: 50px;
    height: 50px;
  }
  .${UG_CSS_PFX}-comment-pfp {
    width: 35px;
    height: 35px;
    float: left;
    display: block;
  }
  .${UG_CSS_PFX}-user-card-pfp {
    width: 1.5em;
    height: 1.5em;
    display: inline-block;
    margin-right: 5px;
  }
  .${UG_CSS_PFX}-vertalign * {
    vertical-align: middle;
  }
  .${UG_CSS_PFX}-like-icon {
    background: url(/sites/all/themes/schoology_theme/images/icons_sprite_feed.png?5c6f21ec0b606228) no-repeat -1px -76px;
    height: 16px;
    width: 16px;
    display: inline-block;
    vertical-align: top;
    margin: 0 2px;
  }
  .${UG_CSS_PFX}-loading {
    pointer-events: none;
    opacity: 0.5;
  }
  `;
  document.head.appendChild(styles);

  function wait(ms) {
    if (ms <= 0) return Promise.resolve();
    return new Promise(res => setTimeout(res, ms));
  }

  function fetchJSON(path, headers, method = 'GET', body = undefined, tolerance = 0) {
    return fetch('https://pausd.schoology.com/portfolios/' + path, {method, headers, body: body && JSON.stringify(body)})
      .then(r => {
        if (r.status === 500 || r.status === 404) {
          if (tolerance < 50) return fetchJSON(path, headers, method, body, tolerance + 1);
          else {
            console.warn('Gave up fetching ' + path);
            return Promise.reject(new SyntaxError());
          }
        }
        return r.json().then(({data}) => data);
      });
  }

  class PortfolioStorer {

    constructor(id, uid) {
      this.uid = uid || siteNavigationUiProps.props.user.uid;
      this.ready = this.getCSRFToken().then(() => {
        return (this.id = id) || this.createPortfolio()
          .then(ids => this.id = this.uid + '-' + ids.join('-'))
          .then(() => this.setupPortfolio());
      });
    }

    getCSRFToken() {
      return fetchJSON('init')
        .then(({csrfToken}) => this.csrfToken = csrfToken);
    }

    createPortfolio() {
      return fetchJSON(`users/${this.uid}/portfolios`, {'X-Csrf-Token': this.csrfToken}, 'POST')
        .then(({id: portfolioID}) => fetchJSON(`users/${this.uid}/portfolios/${portfolioID}/items`,
            {'X-Csrf-Token': this.csrfToken}, 'POST', {item_type: "page", metadata: {}})
          .then(({id: pageID, portfolio: {public_hash}}) => [portfolioID, pageID, public_hash]));
    }

    setupPortfolio() {
      const [uid, portfolioID, pageID, public_hash] = this.id.split('-');
      return Promise.all([
        fetchJSON(`users/${uid}/portfolios/${portfolioID}`, {'X-Csrf-Token': this.csrfToken}, 'PUT',
          {title: 'Underground', description: 'Your ID: ' + this.id}),
        fetchJSON(`users/${this.uid}/portfolios/${portfolioID}/items/${pageID}`,
          {'X-Csrf-Token': this.csrfToken}, 'PUT', {title: 'User data', description: 'Don\'t edit this page!'})
      ]);
    }

    setContent(content) {
      const [, portfolioID, pageID] = this.id.split('-');
      return fetchJSON(`users/${this.uid}/portfolios/${portfolioID}/items/${pageID}`, {'X-Csrf-Token': this.csrfToken}, 'PUT', {metadata: {content}});
    }

    getContent(id = this.id) {
      const [uid, portfolioID, pageID, public_hash] = id.split('-');
      return fetchJSON(`users/${uid}/portfolios/${portfolioID}/items/${pageID}`,
          {'X-Csrf-Token': this.csrfToken, 'X-Public-Hash': public_hash})
        .then(({metadata: {content}}) => content);
    }

    getID() {
      return this.id;
    }

  }

  // https://gist.github.com/gordonbrander/2230317
  const genID = () => Math.random().toString(36).substr(2, 9);

  const defaultUser = {name: '[user failed to load]', bio: "It's possible that my save data got corrupted somehow, or I manually set my name and bio to this.", posts: [], comments: [], following: [], likes: []};

  function randomInt(int) {
    return Math.floor(Math.random() * int);
  }
  function randomGradient() {
    const colour1 = [randomInt(256), randomInt(256), randomInt(256)];
    const colour2 = [randomInt(256), randomInt(256), randomInt(256)];
    return `linear-gradient(${Math.random() * 360}deg, rgb(${colour1.join(',')}), rgb(${colour2.join(',')}))`;
  }

  function escapeHTML(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function parse(json) {
    return JSON.parse(json.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'));
  }

  function stringify(obj) { // Schoology cannot handle emoji
    return escapeHTML(JSON.stringify(obj).replace(/[\uD83C-\uFFFF]/g, m => '\\u' + m.charCodeAt().toString(16)));
  }

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  const markersRegex = /\n\n?|\$([biuxqtBIUXQTL123456$]|#[0-9a-fA-F]{6}|[cC]:.*(?=\n|$))|\$l\(([^)]*)\)/g;
  function markup(code) {
    code = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    let state = {};
    return '<p>' + code.replace(markersRegex, (m, tag = '', link) => {
      if (state.code) {
        if (tag && state.code === tag.slice(1)) {
          state.code = false;
          return '</pre>';
        }
        else return m;
      }
      if (m === '\n\n') {
        const temp = state.tag || 'p';
        state.tag = '';
        return `</${temp}><p>`;
      }
      else if (m === '\n') return '<br>';
      if (tag === '$') return '$';
      if (tag === 'b' && !state.bold) { state.bold = true; return '<strong>'; }
      if (tag === 'B' && state.bold) { state.bold = false; return '</strong>'; }
      if (tag === 'i' && !state.italics) { state.italics = true; return '<em>'; }
      if (tag === 'I' && state.italics) { state.italics = false; return '</em>'; }
      if (tag === 'u' && !state.underline) { state.underline = true; return '<ins>'; }
      if (tag === 'U' && state.underline) { state.underline = false; return '</ins>'; }
      if (tag === 'x' && !state.strikethrough) { state.strikethrough = true; return '<del>'; }
      if (tag === 'X' && state.strikethrough) { state.strikethrough = false; return '</del>'; }
      if (tag === 't' && !state.text) { state.text = true; return '<code>'; }
      if (tag === 'T' && state.text) { state.text = false; return '</code>'; }
      if (m[1] === 'l' && !state.link) { state.link = true; return `<a href="${link.replace(/"/g, '&quot;')}">`; }
      if (tag === 'L' && state.link) { state.link = false; return '</a>'; }
      if (tag === 'q') { state.quoteDepth = (state.quoteDepth || 0) + 1; return '<blockquote>'; }
      if (tag === 'Q' && state.quoteDepth > 0) { state.quoteDepth--; return '</blockquote>'; }
      if (tag[0] === 'c') { state.code = tag.slice(1); return '<pre>'; }
      if (tag[0] === '#') { state.colour = tag; return `<span style="color: ${tag}">`; }
      if ('123456'.includes(tag)) { state.tag = 'h' + tag; return `<h${tag}>`; }
      return m;
    }) + '</p>';
  }

  let ps;
  let userID = localStorage.getItem(STORAGE_KEY);
  let userData, followData, posts, pfps;

  async function refresh() {
    // fetch userData
    userData = parse(await ps.getContent().catch(err => {
      console.log(err, err.name);
      if (err.name === 'SyntaxError') { // JSON parse error
        if (confirm(`Your user data seems to be corrupted; please send the Creators of the Underground your ID (${userID}).\n\nIn the meantime, would you like to create a new account?`)) {
          localStorage.removeItem(STORAGE_KEY);
          userID = null;
          ps = null;
          menuItem.click();
          return 'true';
        }
      }
      return 'false';
    }));
    if (!userData) window.location.reload();
    else if (userData === true) return;
    followData = {};
    let lastRender = Date.now();
    render(false);
    let loaded = 0;
    document.getElementById(UG_CSS_PFX + '-load-progress').textContent = `${loaded} of ${userData.following.length} people that you follow loaded`;
    await Promise.all(userData.following.map(userID => ps.getContent(userID).then(parse).catch(() => defaultUser).then(data => {
      followData[userID] = data;
      const now = Date.now();
      if (now - lastRender > 100) {
        lastRender = now;
        render(false);
      }
      loaded++;
      document.getElementById(UG_CSS_PFX + '-load-progress').textContent = `${loaded} of ${userData.following.length} people that you follow loaded`;
    })));
    render(true);

    return posts;
  }

  function render(loaded = true) {
    const data = clone(followData);
    data[userID] = clone(userData);

    // get posts
    posts = [].concat(...Object.keys(data).map(user => data[user].posts.map(post => (post.author = user, post))));
    posts.sort((a, b) => b.date - a.date); // first post is YOUNGEST

    // assign comments, get PFPs
    const allComments = [];
    pfps = {};
    Object.keys(data).forEach(user => {
      const pfp = data[user].pfp;
      pfps[user] = pfp ? `url(&quot;${encodeURI(pfp)}&quot;)` : randomGradient();

      data[user].comments.forEach(comment => {
        comment.author = user;
        const post = posts.find(post => comment.postID === post.id);
        if (post) {
          if (!post.comments) post.comments = [];
          post.comments.push(comment);
        }
        allComments.push(comment);
      });
    });
    posts.forEach(post => post.comments ? post.comments.sort((a, b) => a.date - b.date) : post.comments = []); // first comment is OLDEST

    // assign likes (not anonymous?) - likes are simply just an array of postID and maybe commentID
    Object.keys(data).forEach(user => data[user].likes.forEach(({target}) => {
      const post = posts.find(post => target === post.id);
      if (post) {
        if (!post.likes) post.likes = [];
        if (!post.likes.includes(user)) post.likes.push(user);
      } else {
        const comment = allComments.find(comment => target === comment.id);
        if (comment) {
          if (!comment.likes) comment.likes = [];
          if (!comment.likes.includes(user)) comment.likes.push(user);
        }
      }
    }));

    if (!loaded) posts = posts.slice(0, 5);

    if (loaded) feed.classList.remove(UG_CSS_PFX + '-loading');
    else feed.classList.add(UG_CSS_PFX + '-loading');
    feed.innerHTML = `
<li style="padding: 5px 24px;">
  <p>${loaded ? `<span tabindex="0" class="clickable" ${UG_ATTR_PFX}-refresh="true">Refresh</span> &middot; <span tabindex="0" class="clickable" ${UG_ATTR_PFX}-sign-out="true">Switch user</span>` : `<img src="/sites/all/themes/schoology_theme/images/ajax-loader.gif" class="more-loading"><span id="${UG_CSS_PFX}-load-progress"></span>`}</p>
  <p>Your user ID: <strong title="Share this to other people so they can see your posts by following you.">${userID}</strong> &middot; <span tabindex="0" class="clickable" ${UG_ATTR_PFX}-set-bio="true">Set bio</span> &middot; <span tabindex="0" class="clickable" ${UG_ATTR_PFX}-set-pfp="true">Set PFP</span></p>
  <p>Following (click to unfollow): ${userData.following.map(user => `<span ${UG_ATTR_PFX}-user="${user}"><span tabindex="0" class="clickable" ${UG_ATTR_PFX}-unfollow="${user}">${followData[user] ? escapeHTML(followData[user].name) : '(not yet loaded)'}</span></span>`).join(', ') || 'no one!'} | <span tabindex="0" class="clickable" ${UG_ATTR_PFX}-add-follow="true">Follow user</span></p>
</li>
<li id="s-update-create-form" style="margin-bottom: 0; border-bottom: none; padding: 5px 20px 35px;">
  <div class="form-item">
    <textarea id="edit-body" placeholder="Write a post" style="box-sizing: border-box; margin: 0; resize: vertical;"></textarea>
  </div>
  <div class="submit-buttons" style="margin-right: 0;">
    <span class="submit-span-wrapper">
      <input type="submit" id="edit-submit" value="Post" ${UG_ATTR_PFX}-post="true">
    </span>
  </div>
</li>
<li id="new-posts" style="display: none;"></li>` + (posts.map(postHTML).join('') || '<li>No one has posted yet!</li>');
  }

  function getData(user) {
    return user === userID ? userData : followData[user];
  }

  function post(content) {
    const now = Date.now();
    const id = genID();
    userData.posts.push({date: now, id, content});
    return ps.setContent(stringify(userData)).then(() => id);
  }
  function editPost(content, postID) {
    const post = userData.posts.find(({id}) => id === postID);
    if (post) {
      post.edited = Date.now();
      post.content = content;
      return ps.setContent(stringify(userData));
    } else return Promise.reject();
  }

  function comment(content, postID) {
    const now = Date.now();
    const id = genID();
    userData.comments.push({date: now, id, content, postID});
    return ps.setContent(stringify(userData)).then(() => id);
  }
  function editComment(content, commentID) {
    const comment = userData.comments.find(({id}) => id === commentID);
    if (comment) {
      comment.edited = Date.now();
      comment.content = content;
      return ps.setContent(stringify(userData));
    } else return Promise.reject();
  }

  function like(targetID) {
    if (userData.likes.find(({target}) => target === targetID)) return Promise.reject();
    const now = Date.now();
    userData.likes.push({date: now, target: targetID});
    return ps.setContent(stringify(userData));
  }
  function unlike(targetID) {
    const index = userData.likes.findIndex(({target}) => target === targetID);
    if (!~index) return Promise.reject();
    userData.likes.splice(index, 1);
    return ps.setContent(stringify(userData));
  }

  function follow(userID) {
    if (userData.following.includes(userID)) return Promise.reject();
    userData.following.push(userID);
    return ps.setContent(stringify(userData));
  }
  function unfollow(userID) {
    const index = userData.following.indexOf(userID);
    if (!~index) return Promise.reject();
    userData.following.splice(index, 1);
    delete followData[userID];
    return ps.setContent(stringify(userData));
  }

  function setBio(content) {
    userData.bio = content;
    return ps.setContent(stringify(userData));
  }
  function setPFP(url) {
    userData.pfp = url;
    return ps.setContent(stringify(userData));
  }

  function postHTML(post) {
    return `
<li>
  <div class="edge-item s-edge-type-update-post">
    <div class="edge-left">
      <div class="${UG_CSS_PFX}-pfp ${UG_CSS_PFX}-post-pfp" style="background-image: ${pfps[post.author]};"></div>
    </div>
    <div class="edge-main-wrapper">
      <div class="edge-sentence">
        <a ${UG_ATTR_PFX}-user="${post.author}">${escapeHTML(getData(post.author).name)}</a>
        <span class="arrow-right"></span>
        <a>The Underground</a>
        <div class="update-body s-rte">${markup(post.content)}</div>
      </div>
      <div class="edge-footer">
        ${post.edited ? `<span title="${escapeHTML(new Date(post.edited).toLocaleString())}">Edited</span> &middot;` : ''}
        <span class="small gray">${escapeHTML(new Date(post.date).toLocaleString())}</span>
        &middot;
        ${likesHTML(post)}
        ${post.author === userID ? `&middot; <span tabindex="0" class="like-btn clickable" ${UG_ATTR_PFX}-edit="${post.id}" ${UG_ATTR_PFX}-edit-mode="post">Edit</span>` : ''}
        <div class="feed-comments">
          <div>${post.comments.map(commentHTML).join('')}</div>
          <div class="s-comments-post-form">
            <div class="post-comment-form mouse-focus">
              <div class="form-item" id="edit-comment-${genID()}">
                <textarea class="form-textarea add-comment-resize" placeholder="Write a comment" style="resize: vertical;"></textarea>
              </div>
              <span class="submit-span-wrapper">
                <input type="submit" value="Post" ${UG_ATTR_PFX}-comment="${post.id}">
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</li>`;
  }

  function commentHTML(comment) {
    return `
<div class="comment">
  <div class="${UG_CSS_PFX}-pfp ${UG_CSS_PFX}-comment-pfp" style="background-image: ${pfps[comment.author]};"></div>
  <div class="comment-contents comment-comment">
    <span class="comment-author"><a ${UG_ATTR_PFX}-user="${comment.author}">${escapeHTML(getData(comment.author).name)}</a></span>
    <div>${escapeHTML(comment.content)}</div>
  </div>
  <div class="comment-footer">
    ${comment.edited ? `<span title="${escapeHTML(new Date(comment.edited).toLocaleString())}">Edited</span> &middot;` : ''}
    <span class="small gray">${escapeHTML(new Date(comment.date).toLocaleString())}</span>
    &middot;
    ${likesHTML(comment)}
    ${comment.author === userID ? `&middot; <span tabindex="0" class="like-btn clickable" ${UG_ATTR_PFX}-edit="${comment.id}" ${UG_ATTR_PFX}-edit-mode="comment">Edit</span>` : ''}
  </div>
</div>`;
  }

  function likesHTML(target) {
    const likes = target.likes || [];
    const liking = likes.includes(userID);
    return `
<span title="Likers: ${likes.map(user => escapeHTML(getData(user).name)).join(', ') || 'none'}"><span tabindex="0" class="like-btn clickable" ${UG_ATTR_PFX}-like="${target.id}" ${UG_ATTR_PFX}-mode="${liking ? 'unlike' : 'like'}">${liking ? 'Unlike' : 'Like'}</span>
<span ${UG_ATTR_PFX}-likes="${likes.length}">${likesText(likes.length)}</span></span>`;
  }

  function likesText(likeCount) {
    return likeCount ? `<span class="${UG_CSS_PFX}-like-icon"></span>` + (likeCount === 1 ? '1 like' : likeCount + ' likes') : '';
  }

  function userCardHTML(user) {
    const data = getData(user);
    if (!data) return `<em>User data not loaded</em>`;
    return `
<div class="${UG_CSS_PFX}-vertalign"><div class="${UG_CSS_PFX}-pfp ${UG_CSS_PFX}-user-card-pfp" style="background-image: ${pfps[user]};"></div><strong>${escapeHTML(data.name)}</strong> ${userData.following.includes(user) ? `<span tabindex="0" class="clickable" ${UG_ATTR_PFX}-unfollow="${user}">Unfollow</span>` : ''}</div>
<p><span class="${UG_CSS_PFX}-id gray">${user}</span></p>
<p>${escapeHTML(data.bio || '')}</p>
<p><strong>Following:</strong></p>
${data.following.map(user => `<p><span class="${UG_CSS_PFX}-id gray">${user}</span> ${user === userID ? '(you)' : userData.following.includes(user) ? `${escapeHTML((getData(user) || {name: '[not loaded]'}).name)}` : `<span tabindex="0" class="like-btn clickable schoology-processed" ${UG_ATTR_PFX}-follow="${user}">Follow</span>`}</p>`).join('') || '<p>(no one)</p>'}`;
  }

  let onedit = null;
  const editPopup = document.createElement('div');
  editPopup.innerHTML = `
<div id="popups-overlay" style="opacity: 0.4; width: 100%; height: 100%; position: fixed;"></div>
<div class="popups-box popups-medium" style="height: 174px; position: fixed; top: 0; left: 0; right: 0; bottom: 0; margin: auto;">
  <div class="popups-title">Edit</div>
  <div class="popups-body">
    <div id="s-comment-edit-comment-form">
      <div class="form-item" id="edit-comment-body-wrapper">
        <textarea class="form-textarea popups-textarea-focus" id="${UG_CSS_PFX}-editor"></textarea>
      </div>
      <div class="submit-buttons">
        <span class="submit-span-wrapper">
          <input type="submit" value="Save" class="form-submit" ${UG_ATTR_PFX}-save-edit="true">
        </span>
        <span class="cancel-btn schoology-processed sExtlink-processed" tabindex="0" ${UG_ATTR_PFX}-close-popup="true">Cancel</span>
      </div>
    </div>
  </div>
</div>`;
  const editor = editPopup.querySelector(`#${UG_CSS_PFX}-editor`);

  let authState = null;
  const feed = document.querySelector('#home-feed-container .s-edge-feed');
  const indicator = document.getElementById('edge-filters-btn');
  const menuItem = document.createElement('span');
  menuItem.className = 'edge-filter-option edge-filter-type-all';
  menuItem.innerHTML = '<span></span>Underground';
  menuItem.addEventListener('click', async e => {
    document.querySelector('#edge-filters-menu .edge-filter-option.active').classList.remove('active');
    menuItem.classList.add('active');
    indicator.textContent = 'Underground';
    let desiredName;
    if (!ps && !userID) {
      feed.innerHTML = `
<li style="padding: 5px 24px;"><a class="link-btn" style="margin-right: 5px;" ${UG_ATTR_PFX}-auth-mode="sign-up">Create account</a>
<a class="link-btn" ${UG_ATTR_PFX}-auth-mode="sign-in">Use existing account</a>
<a class="link-btn disabled" style="float: right;" ${UG_ATTR_PFX}-auth-ok="true" id="${UG_CSS_PFX}-auth-ok">OK</a>
<input type="text" style="width: 100%; box-sizing: border-box; margin: 5px 0;" id="${UG_CSS_PFX}-auth-input" disabled>
</li>`;
      authState = {mode: 'auth-mode'};
      const mode = await new Promise(res => authState.res = res);
      const input = document.getElementById(UG_CSS_PFX + '-auth-input');
      const okBtn = document.getElementById(UG_CSS_PFX + '-auth-ok');
      input.disabled = false;
      if (mode === 'sign-up') {
        input.placeholder = 'Desired display name (you wont\'t be able to change this)';
      } else {
        input.placeholder = 'User ID here (you can find your user IDs on your profile in the portfolios section)';
      }
      authState = {mode: 'get-input', input};
      input.focus();
      okBtn.classList.remove('disabled');
      const text = await new Promise(res => authState.res = res);
      if (mode === 'sign-up') {
        desiredName = text;
      } else {
        localStorage.setItem(STORAGE_KEY, userID = text);
      }
      authState = null;
    }
    feed.innerHTML = '<li><img src="/sites/all/themes/schoology_theme/images/ajax-loader.gif" class="more-loading"></li>';
    if (!ps) {
      ps = new PortfolioStorer(userID);
      await ps.ready;
      if (!userID) {
        // initialize user data
        localStorage.setItem(STORAGE_KEY, userID = ps.id);
        await ps.setContent(stringify({name: desiredName, bio: 'I love SELF! All hail the administration!', following: [], posts: [], comments: [], likes: []}));
      }
      window.ps = ps;
    }
    await refresh();
  });
  document.getElementById('edge-filters-menu').appendChild(menuItem);
  document.addEventListener('click', e => {
    if (e.target.dataset[UG_ATTR_JS_PFX + 'Like']) {
      const liking = e.target.dataset[UG_ATTR_JS_PFX + 'Mode'] === 'like';
      (liking ? like : unlike)(e.target.dataset[UG_ATTR_JS_PFX + 'Like']).then(() => {
        const display = e.target.nextElementSibling;
        let likeCount = +display.dataset[UG_ATTR_JS_PFX + 'Likes'];
        if (liking) {
          likeCount++;
        } else {
          likeCount--;
        }
        e.target.dataset[UG_ATTR_JS_PFX + 'Mode'] = liking ? 'unlike' : 'like';
        e.target.textContent = liking ? 'Unlike' : 'Like';
        display.innerHTML = likesText(likeCount);
        display.dataset.likes = likeCount;
      });
    } else if (e.target.dataset[UG_ATTR_JS_PFX + 'Comment']) {
      const content = e.target.parentNode.previousElementSibling.children[0];
      if (content.value) {
        e.target.disabled = true;
        e.target.parentNode.classList.add('disabled');
        const now = Date.now();
        comment(content.value, e.target.dataset[UG_ATTR_JS_PFX + 'Comment'])
          .then(id => {
            e.target.disabled = false;
            e.target.parentNode.classList.remove('disabled');
            const commentsWrapper = e.target.parentNode.parentNode.parentNode.previousElementSibling;
            commentsWrapper.innerHTML += commentHTML({id, author: userID, content: content.value, date: now});
            content.value = '';
          });
      }
    } else if (e.target.dataset[UG_ATTR_JS_PFX + 'Post']) {
      const content = e.target.parentNode.parentNode.previousElementSibling.children[0];
      if (content.value) {
        e.target.disabled = true;
        e.target.parentNode.classList.add('disabled');
        const now = Date.now();
        post(content.value)
          .then(id => {
            e.target.disabled = false;
            e.target.parentNode.classList.remove('disabled');
            const html = document.getElementById('new-posts');
            html.outerHTML += postHTML({id, author: userID, content: content.value, date: now, comments: []});
            content.value = '';
          });
      }
    } else if (e.target.dataset[UG_ATTR_JS_PFX + 'Refresh']) {
      menuItem.click();
    } else if (e.target.dataset[UG_ATTR_JS_PFX + 'SignOut']) {
      localStorage.removeItem(STORAGE_KEY);
      userID = null;
      ps = null;
      menuItem.click();
    } else if (e.target.dataset[UG_ATTR_JS_PFX + 'AddFollow']) {
      const user = prompt('User ID of person you want to follow (leave empty to cancel):');
      if (user && user !== userID) follow(user);
    } else if (e.target.dataset[UG_ATTR_JS_PFX + 'Unfollow']) {
      unfollow(e.target.dataset[UG_ATTR_JS_PFX + 'Unfollow']).then(() => {
        e.target.outerHTML = `<span tabindex="0" class="clickable" ${UG_ATTR_PFX}-follow="${e.target.dataset[UG_ATTR_JS_PFX + 'Unfollow']}">Unfollowed (click again to refollow)</span>`;
      });
    } else if (e.target.dataset[UG_ATTR_JS_PFX + 'Follow']) {
      follow(e.target.dataset[UG_ATTR_JS_PFX + 'Follow']).then(() => {
        e.target.outerHTML = 'Followed';
      });
    } else if (e.target.dataset[UG_ATTR_JS_PFX + 'SetBio']) {
      setBio(prompt('Set bio to:', userData.bio) || userData.bio);
    } else if (e.target.dataset[UG_ATTR_JS_PFX + 'SetPfp']) {
      const pfp = prompt('Set profile picture URL to (leave empty to remove):', userData.pfp);
      setPFP(pfp === null ? userData.pfp : pfp || null);
    } else if (e.target.dataset[UG_ATTR_JS_PFX + 'Edit']) {
      const editMode = e.target.dataset[UG_ATTR_JS_PFX + 'EditMode'];
      const targetID = e.target.dataset[UG_ATTR_JS_PFX + 'Edit'];
      const targetContent = e.target.parentNode.previousElementSibling.lastElementChild;
      editor.value = editMode === 'comment' ? targetContent.textContent : posts.find(({id}) => id === targetID).content;
      document.body.appendChild(editPopup);
      onedit = () => {
        (editMode === 'comment' ? editComment : editPost)(editor.value, targetID).then(() => {
          if (editMode === 'comment') targetContent.textContent = editor.value;
          else targetContent.innerHTML = markup(editor.value);
        });
      };
    } else if (e.target.dataset[UG_ATTR_JS_PFX + 'SaveEdit']) {
      if (editor.value) {
        if (onedit) onedit();
        document.body.removeChild(editPopup);
        onedit = null;
      }
    } else if (e.target.dataset[UG_ATTR_JS_PFX + 'ClosePopup']) {
      document.body.removeChild(editPopup);
      onedit = null;
    } else if (e.target.dataset[UG_ATTR_JS_PFX + 'AuthMode']) {
      if (authState && authState.mode === 'auth-mode') {
        Array.from(document.querySelectorAll(`[${UG_ATTR_PFX}-auth-mode]`)).forEach(btn => btn.classList.add('disabled'));
        authState.res(e.target.dataset[UG_ATTR_JS_PFX + 'AuthMode']);
      }
    } else if (e.target.dataset[UG_ATTR_JS_PFX + 'AuthOk']) {
      if (authState && authState.mode === 'get-input') {
        if (authState.input.value) authState.res(authState.input.value);
      }
    }
  });
  const card = document.createElement('div');
  card.classList.add(UG_CSS_PFX + '-user-card');
  document.body.addEventListener('mouseover', e => {
    const userLink = e.target.closest(`[${UG_ATTR_PFX}-user]`);
    if (userLink) {
      const user = userLink.dataset[UG_ATTR_JS_PFX + 'User'];
      if (user !== card.dataset[UG_ATTR_JS_PFX + 'LastUser']) {
        card.dataset[UG_ATTR_JS_PFX + 'LastUser'] = user;
        card.innerHTML = userCardHTML(user);
        userLink.appendChild(card);
      }
    } else if (card.parentNode) {
      card.dataset[UG_ATTR_JS_PFX + 'LastUser'] = '';
      card.parentNode.removeChild(card);
    }
  });
})();
