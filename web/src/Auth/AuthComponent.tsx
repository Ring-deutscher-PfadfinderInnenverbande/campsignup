import React from 'react'
import Registration from './Registration'
import Login from './Login'
import {useTranslation} from "../Utils/i18n";
import decode from 'jwt-decode'
import {Text, TextVariants, Button} from '@patternfly/react-core'
import ArrowRightIcon from '@patternfly/react-icons/dist/js/icons/arrow-right-icon';

interface AuthProps{
    isLoggedIn: boolean,
    loggedInChange: Function
}

export default function AuthComponent(props: AuthProps) {
    const t = useTranslation();

    const [showSignup, changeShowSignup] = React.useState(true);

    const handleShowSignupChange = (event:React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        changeShowSignup(!showSignup);
    }
    
    const loggedIn =  () => {
        const token = getToken()
        let isLoggedIn =  !!token && !isTokenExpired(token)
        props.loggedInChange(isLoggedIn);
        return isLoggedIn;
    }
    const isTokenExpired = (token: string) => {
        try {
            const decoded: any = decode(token);
            if (decoded.exp < Date.now() / 1000) {
                return true;
            }
            else
                return false;
        }
        catch (err) {
            return false;
        }
    }
    const getToken = () => {
        return localStorage.getItem('token')
    }

    return (
        <>
            {loggedIn() ? 
                <>Du bist eingeloggt!</>
                :<>
                {showSignup 
                ?<>
                    <Text component={TextVariants.h2}>
                        {t({
                        de: <>Account anlegen</>,
                        en: <>Create Account</>,
                        })}
                    </Text>
                    <Text>
                        {t({
                        de: <>
                            Für die Verwaltung deines Stammes benötigst du ein Benutzer*innenkonto. Fülle dazu das untenstehende Formular mit einer gültigen Email-Adresse und deinem gewünschten Passwort aus. 
                        </>,
                        en: <>Login</>,
                        })}
                    </Text>
                    <Text>
                        {t({
                            de: <>
                                Bereits registriert?  <Button variant="link" onClick={handleShowSignupChange} isInline style={{display: "inline-block", marginLeft:"2em"}}>Einloggen <ArrowRightIcon/></Button>
                            </>,
                            en: <>
                                Already registered? <Button variant="link" onClick={handleShowSignupChange} isInline style={{display: "inline-block", marginLeft:"2em"}}>Log In <ArrowRightIcon/></Button>
                            </>
                        })}
                    </Text>
                
                    <Registration logInChange={loggedIn}/>
                </>
                :<>
                <Text component={TextVariants.h2}>
                        {t({
                        de: <>Login</>,
                        en: <>Login</>,
                        })}
                    </Text>
                    <Text>
                        {t({
                            de: <>
                                Noch kein Konto?  <Button variant="link" onClick={handleShowSignupChange} isInline style={{display: "inline-block", marginLeft:"2em"}}>Registrieren <ArrowRightIcon/></Button>
                            </>,
                            en: <>
                                Need an account? <Button variant="link" onClick={handleShowSignupChange} isInline style={{display: "inline-block", marginLeft:"2em"}}>Sign Up <ArrowRightIcon/></Button>
                            </>
                        })}
                    </Text>
                    <Login logInChange={loggedIn} />
                </>
                }
                </>
            }
        </>
    )
}
