import type { APIContext } from "astro";
import ENDPOINTS from "../../config/config";



export async function POST(context: APIContext): Promise<Response> {
	const formData = await context.request.formData();
	const code = formData.get("code");
	const password = formData.get("password");
    const response = await fetch(ENDPOINTS.LOGIN, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            code,
            password,
        }),
    });
    const data = await response.json();
    if (response.ok){
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Set-Cookie": `token=${data.token}; HttpOnly; Path=/; SameSite=Strict;`,
            },
        });
    }

    return new Response(JSON.stringify(data), {
        status: response.status
    });
}


export async function GET(context: APIContext): Promise<Response> {
    const token = context.cookies.get("token");

    await fetch(ENDPOINTS.LOGOUT, {
        headers: {
            "Authorization": `Bearer ${token}`
        }});
    
        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        headers.append(
            "Set-Cookie",
            "token=; HttpOnly; Path=/; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
        );
        headers.append(
            "Set-Cookie",
            "user=; HttpOnly; Path=/; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
        );
        headers.append(
            "Set-Cookie",
            "user=; HttpOnly; Path=/api; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
        );

        headers.append(
            'Location', '/'
        )
    return new Response(JSON.stringify({message: "Logged out"}), {
        status: 303,
        headers: headers
    })
}