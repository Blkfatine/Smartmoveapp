import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  
  // Attach Bearer token to internal backend requests only
  const isExternal = req.url.includes('nominatim.openstreetmap.org') ||
                     req.url.includes('router.project-osrm.org') ||
                     req.url.includes('open-meteo.com');

  if (token && !isExternal) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(authReq);
  }
  return next(req);
};
