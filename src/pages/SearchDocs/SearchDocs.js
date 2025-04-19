import React, { useRef, useState, useEffect } from "react";
import Navbar from "../../components/Navbar/Navbar";
import axios from "axios";
import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";

const API_TOKEN =
  "pk.eyJ1IjoibWFuYW4xNyIsImEiOiJjbGF0N3pkMGgxdnBhM25udmhuZmVwdzRyIn0.roV1T7xiEcFCXMjCkYJxsg";
mapboxgl.accessToken = API_TOKEN;
const map_id =
  "dXJuOm1ieHJldDowcEJoNE9jeDhTc1A3cktxNVgwWUNfbk1CVGZIbnVBeVY1X09XSzdPN01tMnhXaTZIbXF3a3RTWVlUYnNEcUFFVmNReU91S2VMZFdtSDU1Ty1LalE4MU41RVVMTi1EQ0x4R013UFlveGlQenVnWW5FNHF4TE4tUUxFZGFIckg4UnUyMmxjRXlOcTEwbVd6dmIwMlJCNXR5b2lPMk1xSmI0UHdoX2V1anhnTDNTV1U1U1JpZGFPVkYwTm9VQ3RfUHRYQmkxTFlueXg5djZPV2ktWGphREd2MEsyMEl3WWc5dl9JSmh2WTRfWEd0SVZTSEJua0xEclNnblI4OUJua1VCcV81SFlGVW52RlZQT2hVNktoVlZfVlp5ZTVMVDBRYmkwSWM4dUlkN1VYT0VQY0p3MnJ4UlpoTjZOVnp1MzZvNW1ydHo0eXZTSGdnTVQtNUFqY3BZTDg5dGFHSjltYm5MVVl4T1RaSnJ2QXVXb0FBVTI0R2VyQWp2c2lfXzYyaTNjQlVuN0tQX3hiNVkzZWkxNXZZLXFHZE1YeWp1bmhQcE9Rc3FOQVJLd1VzNWlGelhmeFNSUlNmZ1MyVk52VmFVNFdFUlZJSm00dXM5T0Jody13eURjSDRNVEx3TGNhYTVMSlI0eVV1cXZKUGJod3BXZjdIUFB2VkZnQjQ5UHhIcjVkT0t5STNpVDRER05YODVId20tYU90U08tRDNJODdUZ1VKdUJ5V1p5TThpX3ItRm5VVGNUVXZHemVPQmdrT0ZVNjZCX3lTSWdVT2xUUjMxMG5MdjdCMWxfS1FnSFdST2JzdG05U3J6UVZma3plMVFUa1dmWFJzZTVfSmE2R0lIQ3hncFlEdDdieTVDZnhYRl9pMTN4RTJqXzdOV1hlc0tRSGg5WWtSRVhDR1lDLUZMbHpvRExFaG5qRjgtelpoOWdfMVdidWNjY3dMZmdNZHlPZlFHRmZwVXctUWdfN0RPY1lDLWF6M2NodXRiSTdJX1R2MU10cTM3dUNvQ3pjc0d6RFBQZm9kT1hveF9VYzVIUkxEXzM0dVphblZMMzZWZ2FhOWpDa2NyVlJOcHptV0xFa1RCNkZnT3o2bDRaTDZiclpsQUZna0RxSDNyQWlqUnhOTm5vOUQ1SjZmTk9rd0NHUmdxdFluOFliNVpvdHl6QUtYX01pT2hoNk0zckVkbU5aMDVIMmhIN010QUc3c0R0TEtKTGxLODF4Z1loc3lMWWdnZFVfdDIzeWZVMmlFejRXVEMxcDE2dnZONktDUlZaU1NzYlJKMHFlVmQ2Z2hVckNSV2s3eVcyS3Bob3pXZVpOYS1DUVVrd2ppQnJwcVgyc1ZTX3MtNnhISW9yMVlTTHpDM3RJRkN5b0ZIMzRyWHltZWk5Mi1vZkVrcDU1cFJXTDhJcUxfczRGWnh6aUk2RUpiemxFWGRaM3p1OFFCQUhmT2EweWRfRkx4Mmt5eHdnMlB5X2M2MDBkV05BeXBpQVdWTFZia2FsNFBqRGd3Y2Rvb3dHWEQzU21ncV9WZzNjUDNLal85Q0dYQnVvWjVIWW56U0h5Qm53Mm9sWkFzdHJNV3c0T2FMWURfNU1CQVo0Y1BLN0JseDZLWTBYOEt2amRfV0FJSENxQ0tRcnd0a0U1RThmOTFqYXp2U1p3U1gyNFhYczZjQzcwTUhxX3RVaWZ2OUJCVlpqSkZIWnpFMnltak1DRXBlb0QzNE05dzljM1AzenZPMnZGYnUyYllrNkJsX3NFazNqLUlVTE1jVXExTXNPSGZoNkZVWUtVVDlFUXhxbVNJNGdKYVJiTXBTQWFuLXpFQlBpRm9EUlFEdGdqZDYtbWtsSmhZQ3JFNndQRzhxR2N5Yk1TWk9tWGh5V0U2UHdJLVZTQ01HN0xyVXZmLTNRVC1uWlp0Q0k2UTRnbThoTmtLTU1JMnJhVnVjVlN2ZWdmWnl0VEoxS3JMS1VYRXFORTE5TDVHLU0zaGIzRGdjMEFTOFFSdllDZTFFU0pDcWE3ODBRUThyLVg5Z1o5Mk9tYzJtbW1nY01TRkZUMFlKQW8yT1Nac3VlbGswajJhTWxxdG95UGdqckNISm43T2lVX0JEcmpwcXkzX2tVNjAtVlZETmFycnNkb0VuME54b1AzTWtnSHd4elFrYVlDXzZtTmJUNUpGa0NJZUhXaV8zVlJSUS1BdkpoMXJ5N0FYMi1hbnpoV21lTmkxSVl0ZmNXWGhmTHZZVHMzeTVxN2FwZ3czeXE2STRSVjRCMmt3NnB2TFA4UENVQ1lfaUlHOHktVFczMG10eUpsNDhhYlNJNzB1S1h3blJwRjFmMWdnRkxSbnB3ZEJqSkROU0h6aWpSellMQnNjMkZpbDVNelVCX2lURVk0b2NrOURvUWJ5MEl6cVFWcTVSNlh5U1QzcWlfZHotZDM2R3B6Y3AzRWdfVzdpNjlEUUgySDZ1eEJjMU1zQ3NidW9EOTRodmJjcXdrc2xkM3JyWXUtTTVWTmRIQUIxdWRHWVpiMjRYTnoyMkZ0TkkteFFjSkdUWTJ5SGdpemhpdVdiWWhpcU5nZzJlbkZPVXlJV3kyOHJkaXBFSWtjeV9CQm1UUVZSU09UVlRWbHphNHRhYzQyYUYwTjVUOUt2MjVHaG1RdFRoYzhIbXFTY1h6bzQwUVZsRHMxMDRFR0tkTkRkdXJuR2d0RjB2NVR5RldGT1NOTGhEcGZyOVAyTT0";

const SearchDocs = () => {
  // Set default location to Phoenix, Arizona
  const [lng, setLng] = useState(-112.0740);
  const [lat, setLat] = useState(33.4484);
  const [zoom, setZoom] = useState(9);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    // Fetch doctors when the component mounts
    getDoctors();
  }, []);

  const getDoctors = async () => {
    // Including "arizona" in the query to help target the search
    const url = `https://api.mapbox.com/search/searchbox/v1/suggest?q=doctor%20arizona&language=en&proximity=${lng},${lat}&country=us&session_token=02dcad2a-1890-4bc1-88ae-83109b80c3a9&access_token=${API_TOKEN}`;
    const result = await axios.get(url);
    console.log(result.data);
    setDoctors(result.data.suggestions);
  };

  const map = useRef(null);
  const mapContainer = useRef(null);

  const fetchLocation = async (map_id) => {
    const url = `https://api.mapbox.com/search/searchbox/v1/retrieve/${map_id}?session_token=0dca88fe-dac2-4f31-88ae-83ccd8a0b719&access_token=${API_TOKEN}`;
    const result = await axios.get(url);
    console.log(result.data.features[0].geometry.coordinates);
    new mapboxgl.Marker()
      .setLngLat(result.data.features[0].geometry.coordinates)
      .addTo(map.current);

    mapContainer.current.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (map.current) return; // Initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: zoom,
    });

    map.current.on("move", () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });
  }, [lng, lat]);

  return (
    <div className="flex flex-row">
      <Navbar />
      <div className="w-full">
        <div className="flex flex-row items-center p-6 bg-teal-100 h-fit shadow-lg">
          <h1 className="ml-4 text-3xl font-semibold text-teal-800">
            Recommended Doctors in Arizona
          </h1>
        </div>
        <div className="p-6">
          <table className="table-auto w-full">
            <thead className="bg-neutral-100 h-[50px] shadow">
              <tr>
                <th>
                  <h1 className="text-lg font-bold text-teal-800">Name</h1>
                </th>
                <th>
                  <h1 className="text-lg font-bold text-blue-800">Address</h1>
                </th>
                <th>
                  <h1 className="text-lg font-bold text-sky-900">Colony</h1>
                </th>
                <th>
                  <h1 className="text-lg font-bold text-green-800">Type</h1>
                </th>
              </tr>
            </thead>
            <tbody>
              {doctors?.map((doc) => (
                <tr
                  key={doc.mapbox_id}
                  onClick={() => fetchLocation(doc.mapbox_id)}
                  className="bg-white h-[50px] shadow cursor-pointer"
                >
                  <td>
                    <h1 className="text-lg font-semibold text-teal-800 px-2">
                      {doc?.name}
                    </h1>
                  </td>
                  <td>
                    <h1 className="text-lg font-semibold text-blue-800">
                      {doc?.full_address || "No address available"}
                    </h1>
                  </td>
                  <td>
                    <h1 className="text-lg font-semibold text-sky-900">
                      {doc?.context?.locality?.name}
                    </h1>
                  </td>
                  <td>
                    <h1 className="text-lg font-semibold text-green-800">
                      {doc?.poi_category && doc.poi_category.length > 0
                        ? doc.poi_category[0]
                        : "N/A"}
                    </h1>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div ref={mapContainer} className="h-[400px]" />
      </div>
    </div>
  );
};

export default SearchDocs;
