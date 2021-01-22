import React, {useState, useEffect} from "react";
import {Feather as Icon, FontAwesome} from "@expo/vector-icons";
import {useNavigation, useRoute} from "@react-navigation/native";
import {RectButton} from "react-native-gesture-handler";
import {View, Text, Image, TouchableOpacity, SafeAreaView, Linking} from "react-native";
import api from "../../services/api";
import * as MailComposer from 'expo-mail-composer';
import AppLoading from "expo-app-loading";


import styles from "./styles";

interface Params {
    point_id: number;
}

interface Data {
    image: string;
    image_url: string;
    name: string;
    email: string;
    whatsapp: string;
    city: string;
    uf: string;
    items: {
        title: string;
    }[];
}

const Detail = () => {
    const [point, setPoint] = useState<Data>({} as Data);
    const [items, setItems] = useState("");

    const navigation = useNavigation();
    const route = useRoute();
    const routeParams = route.params as Params;

    useEffect(() => {
        api.get(`/points/${routeParams.point_id}`).then(response => {
            const data = response.data as Data;
            setPoint(data);
            setItems(data.items.map((item) => item.title).join(", "));
        });
    }, []);

    const handleNavigateBack = () => {
        navigation.goBack();
    };

    const handleMailCompose = () => {
        MailComposer.composeAsync({
            subject: "Interesse na coleta de resíduos",
            recipients: [point.email],
        })
    };

    const handleWhatsapp = () => {
        Linking.openURL(`whatsapp://send?phone=${point.whatsapp}&text=Tenho interesse na coleta de resíduos`);
    }


    if (point == Object({})) {
        return <AppLoading/>;
    }

    return (
        <SafeAreaView style={{flex: 1}}>
            <View style={styles.container}>
                <TouchableOpacity onPress={handleNavigateBack}>
                    <Icon name="arrow-left" size={20} color="#34cb79"/>
                </TouchableOpacity>

                <Image
                    style={styles.pointImage}
                    source={{uri: point.image_url}}
                />

                <Text style={styles.pointName}>{point.name}</Text>
                <Text style={styles.pointItems}>{items}.</Text>

                <View style={styles.address}>
                    <Text style={styles.addressTitle}>Endereço</Text>
                    <Text style={styles.addressContent}>{point.city}, {point.uf}.</Text>
                </View>

                <View style={styles.footer}>
                    <RectButton style={styles.button} onPress={handleWhatsapp}>
                        <FontAwesome name="whatsapp" size={20} color="#fff"/>
                        <Text style={styles.buttonText}>Whatsapp</Text>
                    </RectButton>

                    <RectButton style={styles.button} onPress={handleMailCompose}>
                        <Icon name="mail" size={20} color="#fff"/>
                        <Text style={styles.buttonText}>E-mail</Text>
                    </RectButton>
                </View>

            </View>
        </SafeAreaView>
    );
};

export default Detail;