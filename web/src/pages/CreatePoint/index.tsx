import React, {useEffect, useState, ChangeEvent, FormEvent} from "react";
import {Link, useHistory} from "react-router-dom";
import {FiArrowLeft} from "react-icons/fi";
import {MapContainer, useMapEvents, TileLayer, Marker} from "react-leaflet";
import {LeafletMouseEvent} from "leaflet";
import Swal from 'sweetalert2';
import axios from "axios";
import api from "../../services/api";

import "./styles.css";
import Dropzone from "../../components/Dropzone";
import logo from "../../assets/logo.svg";

interface Item {
    id: number,
    title: string,
    image_url: string
}

interface IBGEUFResponse {
    sigla: string;
}

interface IBGECityResponse {
    nome: string;
}


const CreatePoint = () => {
    const [items, setItems] = useState<Item[]>([]);

    const [ufs, setUfs] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);


    const [selectedUf, setSelectedUf] = useState("0");
    const [selectedCity, setSelectedCity] = useState("0");
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [selectedFile, setSelectedFile] = useState<File>();


    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: '',
    });

    const history = useHistory();


    // Executado única vez
    useEffect(() => {
        api.get("/items").then(response => {
            setItems(response.data);
        });
    }, []);

    useEffect(() => {
        axios
            .get<IBGEUFResponse[]>(
                "https://servicodados.ibge.gov.br/api/v1/localidades/estados"
            )
            .then((response) => {
                const ufInitials = response.data.map((uf) => uf.sigla);
                setUfs(ufInitials);
            });
    }, []);


    useEffect(() => {
        if (selectedUf === "0") return;
        axios
            .get<IBGECityResponse[]>(
                `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`
            )
            .then((response) => {
                const cityNames = response.data.map((city) => city.nome);
                setCities(cityNames);
            });
    }, [selectedUf]);

    const handleSelectUF = (event: ChangeEvent<HTMLSelectElement>) => {
        const uf = event.target.value;
        setSelectedUf(uf);
    };

    const handleSelectCity = (event: ChangeEvent<HTMLSelectElement>) => {
        const city = event.target.value;
        setSelectedCity(city);
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = event.target;
        setFormData({...formData, [name]: value});
    }

    const handleSelectItem = (id: number) => {
        const alreadySelected = selectedItems.findIndex((item) => item === id);
        if (alreadySelected >= 0) {
            const filteredItems = selectedItems.filter((item) => item !== id);
            setSelectedItems(filteredItems);
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    }

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        const {name, email, whatsapp} = formData;
        const uf = selectedUf;
        const city = selectedCity;
        const [latitude, longitude] = selectedPosition;
        const items = selectedItems;

        const data = new FormData();

        data.append('name', name);
        data.append('email', email);
        data.append('whatsapp', whatsapp);
        data.append('uf', uf);
        data.append('city', city);
        data.append('latitude', String(latitude));
        data.append('longitude', String(longitude));
        data.append('items', items.join(', '));

        if (selectedFile) {
            data.append('image', selectedFile);
        }

        await api.post('/points', data);


        await Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: '<span style="color:#322153">Ponto de coleta cadastrado !<span>',
            showConfirmButton: false,
            timer: 1500
        });

        history.push('/');
    }

    const PositionMarker = () => {
        const map = useMapEvents({
            click(event: LeafletMouseEvent) {
                const {lat, lng} = event.latlng
                setSelectedPosition([lat, lng]);
                map.flyTo(event.latlng, map.getZoom());
            },
        });
        if (selectedPosition[0] === 0 && selectedPosition[1] === 0) {
            map.locate({setView: true, maxZoom: 15});
        }
        return <Marker position={selectedPosition}/>;
    }


    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta"/>

                <Link to="/">
                    <FiArrowLeft/>
                    Voltar para home
                </Link>
            </header>

            <form onSubmit={handleSubmit} autoComplete="off">
                <h1>Cadastro do ponto de coleta</h1>

                <Dropzone onFileUploaded={setSelectedFile}/>

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input type="text" name="name" id="name" onChange={handleInputChange}/>
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input type="email" name="email" id="email" onChange={handleInputChange}/>
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input type="text" name="whatsapp" id="whatsapp" placeholder="(DDD) 9XXXX-XXXX"
                                   onChange={handleInputChange}/>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <MapContainer zoom={15}>
                        <TileLayer
                            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <PositionMarker/>
                    </MapContainer>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select value={selectedUf} name="uf" id="uf" onChange={handleSelectUF}>
                                <option value="0">Selecione uma UF</option>
                                {ufs.map((uf) => (
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select name="city" id="city" onChange={handleSelectCity}>
                                <option value="0">Selecione uma cidade</option>
                                {cities.map((city) => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Ítens de coleta</h2>
                        <span>Selecione um ou mais ítens abaixo</span>
                    </legend>

                    <ul className="items-grid">
                        {items.map(item => (
                            <li key={item.id}
                                className={selectedItems.includes(item.id) ? 'selected' : ''}
                                onClick={() => handleSelectItem(item.id)}>
                                <img src={item.image_url} alt={item.title}/>
                                <span>{item.title}</span>
                            </li>
                        ))}
                    </ul>

                    <button type="submit">
                        Cadastrar ponto de coleta
                    </button>
                </fieldset>
            </form>
        </div>
    );
}

export default CreatePoint;