import React, {useState } from 'react';
import { IntlProvider } from 'react-intl';
import English from '../i18n/locale/en-US.json';
import Spanish from '../i18n/locale/es-MX.json';
import Portuguese from '../i18n/locale/pt-BR.json';

export const Context = React.createContext();
const local = navigator.language;

let lang;
if( local === 'en-US') {
  lang = English;
} else if( local === 'es-MX') {
  lang = Spanish;
} else if( local === 'pt-BR') {
  lang = Portuguese;
}

const Wrapper = (props) => {
    const [locale, setLocale] = useState(local);
    const [messages, setMessages] = useState(lang);

    function selectLang(e) {
        console.log(e.target.value);
        const newLocale = e.target.value;
        setLocale(newLocale);
        if(newLocale === 'en-US') {
            setMessages(English);
        } else if(newLocale === 'es-MX') {
            setMessages(Spanish);
        } else if(newLocale ==='pt-BR') {
            setMessages(Portuguese);
        }
    }

    return(
        <Context.Provider value={{locale, selectLang}}>
            <IntlProvider messages={messages} locale={locale}>
                {props.children}
            </IntlProvider>
        </Context.Provider>
    )
}

export default Wrapper
