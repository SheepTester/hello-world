use std::{collections::HashMap, process::exit};

use dialoguer::{Input, Password, theme::ColorfulTheme};
use keyring::Entry;
use reqwest::{Client, Response};

use crate::util::MyResult;

mod load;
mod util;

fn get_cookie(response: &Response, cookie_name: &str) -> Option<String> {
    for header_value in response.headers().get_all("set-cookie") {
        if let Some((cookie, _)) = header_value
            .to_str()
            .ok()
            .and_then(|set_cookie| set_cookie.split_once(';'))
        {
            if cookie.starts_with(cookie_name) {
                return Some(
                    cookie
                        .replace(&format!("{cookie_name}="), "")
                        .replace("\"", ""),
                );
            }
        }
    }
    None
}

async fn get_scratch_sessions_id(client: &Client) -> MyResult<String> {
    let entry = Entry::new("questionable-host", "scratchsessionsid")?;
    let mut session_id = match entry.get_password() {
        Ok(password) => Some(password),
        Err(keyring::Error::NoEntry) => None,
        Err(err) => Err(err)?,
    };
    Ok(loop {
        if session_id.is_none() {
            let Some(csrftoken) = get_cookie(
                &client
                    .get("https://scratch.mit.edu/csrf_token/")
                    .send()
                    .await?,
                "scratchcsrftoken",
            ) else {
                eprintln!("Failed to get CSRF token. This is bad.");
                exit(1);
            };

            let username: String = Input::with_theme(&ColorfulTheme::default())
                .with_prompt("Username")
                .interact_text()
                .unwrap();
            let password = Password::with_theme(&ColorfulTheme::default())
                .with_prompt("Password")
                .interact()
                .unwrap();

            let mut body = HashMap::new();
            body.insert("username", username);
            body.insert("password", password);
            let response = client
                .post("https://scratch.mit.edu/accounts/login/")
                .header("referer", "https://scratch.mit.edu/")
                // you need both
                .header("cookie", format!("scratchcsrftoken=\"{csrftoken}\""))
                .header("x-csrftoken", csrftoken)
                // apparently necessary
                .header("x-requested-with", "XMLHttpRequest")
                .json(&body)
                .send()
                .await?;
            if !response.status().is_success() {
                eprintln!(
                    "Failed to log in. HTTP {} error: {}",
                    response.status(),
                    response.text().await?
                );
                continue;
            }
            let Some(scratchsessionsid) = get_cookie(&response, "scratchsessionsid") else {
                eprintln!("Scratch didn't seem to send a session ID. Weird.");
                continue;
            };
            session_id = Some(
                scratchsessionsid
                    .replace("scratchsessionsid=\"", "")
                    .replace("\"", ""),
            )
        }
        if let Some(session_id_val) = &session_id {
            let response = client
                .get("https://scratch.mit.edu/session/")
                .header("referer", "https://scratch.mit.edu/")
                .header("cookie", format!("scratchsessionsid=\"{session_id_val}\""))
                .header("x-requested-with", "XMLHttpRequest")
                .send()
                .await?;
            if !response.status().is_success() {
                eprintln!(
                    "Session ID seems to be invalid. HTTP {} error: {}",
                    response.status(),
                    response.text().await?
                );
                session_id = None;
            }
        }
        if let Some(session_id) = session_id {
            entry.set_password(&session_id)?;
            break session_id;
        }
    })
}

#[tokio::main]
async fn main() -> MyResult<()> {
    let client = Client::new();

    println!("Hello, world! {}", get_scratch_sessions_id(&client).await?);

    Ok(())
}
