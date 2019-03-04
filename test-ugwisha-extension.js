UgwishaExtensions.register((() => {
  const wrapper = createElement('div', {
    children: [
      createElement('p', {
        html: 'DOWN WITH SELF.'
      })
    ]
  });

  return {
    id: 'test-ugwisha-extension',
    wrapper: wrapper,
    name: 'test',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Flock_of_sheep.jpg/158px-Flock_of_sheep.jpg'
  };
})());
