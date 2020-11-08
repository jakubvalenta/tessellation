import { http, httpImageData } from './utils/http.js';

export function getCurrentUser() {
  return http('GET', '/accounts/api/users/me')
    .then(data => {
      return {
        username: data.username,
        isAuthenticated: data.is_authenticated,
        isStaff: data.is_staff,
        maxCompositions: data.max_compositions,
        urlLogout: data.url_logout,
        urlProfile: data.url_profile,
        urlAdmin: data.url_admin
      };
    })
    .catch(() => {
      return {};
    });
}

export function getCompositions() {
  return http('GET', '/api/compositions/');
}

export function createComposition(data) {
  const promises = data.images.map(image => {
    return httpImageData(image.url).then(data => {
      image.data = data;
    });
  });
  data.public = true;
  return Promise.all(promises).then(() =>
    http('POST', '/api/compositions/', data)
  );
}

export function patchCompositionFeatured(compositionId, featured) {
  return http('PATCH', `/api/compositions/${compositionId}`, {
    featured
  });
}

export function patchCompositionName(compositionId, name) {
  return http('PATCH', `/api/compositions/${compositionId}`, {
    name
  });
}

export function deleteComposition(compositionId) {
  return http('DELETE', `/api/compositions/${compositionId}`);
}
