import { defineMiddleware } from "astro:middleware";


export const onRequest = defineMiddleware((context, next) => {
    context.locals.token = context.cookies.get("token")?.value;
    context.locals.user = context.cookies.get("user")?.json();
    return next();
});