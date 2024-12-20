import qs from "qs";
import axios from "axios";
import * as cheerio from 'cheerio';
import iconv from "iconv-lite";
import { CookieJar } from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";
import sira from "../config/constants/sira";


interface Teacher {
  id: string;
  name: string;
  subject: string;
  codeSubject: string;
}
const authSira = async (code: string, password: string) => {
  try {
    const jar = new CookieJar();
    const client = wrapper(axios.create({ jar }));
    const response = await client.post(
      sira.baseUrl,
      qs.stringify({
        'redirect': "",
        'usu_login_aut': code,
        'usu_password_aut': password,
        'imageField.y': "6",
        'imageField.x': "44",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        responseType: "arraybuffer",
      }
    );
   
    const html = iconv.decode(response.data, "ISO-8859-1");
    const $ = cheerio.load(html);
    
    if ( $("script").text().includes("alert")) {    
        const error = $("script").text().match(/alert\s*\(\s*\'\s*(.*?)\s*\'\s*\)/);
      throw new SiraServiceException(error ? error[0] : "Error al autenticar");
    }
    const cookies = jar.getCookiesSync(sira.baseUrl);
    const session = cookies.filter((cookie) => cookie.key === "PHPSESSID")[0]
      .value;
    return session;
  } catch (error) {
    if (error instanceof SiraServiceException) {
      throw error;
    }
    console.error(error);
    throw new SiraServiceException("Error al autenticar");
  }
};

const teacherHistory = async (session: string) => {
  try {
    const jar = new CookieJar();
    const client = wrapper(axios.create({ jar }));
    let response = await client.get(
      sira.baseUrl + sira.homePath,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Cookie: `PHPSESSID=${session}`,
        },
        responseType: "arraybuffer",
      }
    );

    if (response.status !== 200) {
      throw new SiraServiceException("Error al consultar historial");
    }

    const html = iconv.decode(response.data, "ISO-8859-1");
    const $ = cheerio.load(html);

    const forms = $("form");
    if (forms.length === 0) {
      throw new SiraServiceException("No se encontraron profesores");
    }

    const teachers: Teacher[] = [];
    forms.each((i, form) => {
      const name = $(form).find("li").eq(0).text().trim();
      const subject = $(form)
        .find('input[name="apd_asi_nombre"]')
        .eq(0)
        .attr("value");
      const id = $(form)
        .find('input[name="ase_apd_doc_codigo"]')
        .eq(0)
        .attr("value");

      const codeSubject = $(form).find('input[name="ase_apd_asi_codigo"]').eq(0).attr("value");

      if (id && name && subject && codeSubject) {
        teachers.push({ id, name, subject, codeSubject });
      }
    });

    return teachers;
  } catch (error) {
    if (error instanceof SiraServiceException) {
      throw error;
    }
    console.error(error);
    throw new SiraServiceException("Error al consultar historial");
  }
};




class SiraServiceException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SiraServiceException";
  }
}



export { authSira, teacherHistory };
export default SiraServiceException;