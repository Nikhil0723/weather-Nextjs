import axios from "axios";
import React, { createContext, useState, useContext, useEffect } from "react";
import { debounce } from "lodash";
import defaultStates from "../utils/defaultStates";

const GlobalContext = createContext();
const GlobalContextUpdate = createContext();

export const GlobalContextProvider = ({ children }) => {
  const [forecast, setForecast] = useState({});
  const [geoCodedList, setGeoCodedList] = useState(defaultStates);
  const [inputValue, setInputValue] = useState("");
  const [activeCityCoords, setActiveCityCoords] = useState([51.752021, -1.257726]);
  const [airQuality, setAirQuality] = useState({});
  const [fiveDayForecast, setFiveDayForecast] = useState({});
  const [uvIndex, setUvIndex] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async (url, setData) => {
    try {
      const res = await axios.get(url);
      setData(res.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData(`/api/weather?lat=${activeCityCoords[0]}&lon=${activeCityCoords[1]}`, setForecast);
    fetchData(`/api/pollution?lat=${activeCityCoords[0]}&lon=${activeCityCoords[1]}`, setAirQuality);
    fetchData(`/api/fiveday?lat=${activeCityCoords[0]}&lon=${activeCityCoords[1]}`, setFiveDayForecast);
    fetchData(`/api/uv?lat=${activeCityCoords[0]}&lon=${activeCityCoords[1]}`, setUvIndex);
  }, [activeCityCoords]);

  const handleInput = (e) => {
    setInputValue(e.target.value);
    if (e.target.value === "") {
      setGeoCodedList(defaultStates);
    }
  };

  useEffect(() => {
    const debouncedFetch = debounce((search) => {
      fetchData(`/api/geocoded?search=${search}`, setGeoCodedList);
    }, 500);

    if (inputValue) {
      debouncedFetch(inputValue);
    }

    return () => debouncedFetch.cancel();
  }, [inputValue]);

  return (
    <GlobalContext.Provider
      value={{
        forecast,
        airQuality,
        fiveDayForecast,
        uvIndex,
        geoCodedList,
        inputValue,
        loading,
        error,
        handleInput,
        setActiveCityCoords,
      }}
    >
      <GlobalContextUpdate.Provider
        value={{
          setActiveCityCoords,
        }}
      >
        {children}
      </GlobalContextUpdate.Provider>
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);
export const useGlobalContextUpdate = () => useContext(GlobalContextUpdate);
