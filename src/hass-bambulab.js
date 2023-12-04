import axios from 'axios';
import fs from 'fs/promises';

let usagedata;

try {
  usagedata = JSON.parse(await fs.readFile('./data/hass-data.json', 'utf-8'));
  Object.values(usagedata).forEach((filament) => {
    if (!filament.colorname) {
      filament.colorname = '';
    }
  });
} catch (e) {
  usagedata = {};
}

const getAMSTrays = async (sensor) => {
  try {
    const hassUrl = process.env.HASS_URL;
    const token = process.env.HASS_TOKEN;

    // Get all states for the sensor
    const { data } = await axios.get(`${hassUrl}/api/states/${sensor}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (data?.attributes && data?.attributes?.tag_uid !== '0000000000000000' && data?.attributes?.remain !== -1) {
      return {
        type: data.attributes.type,
        manufacturer: 'BambuLab',
        tracking: true,
        size: 1000,
        tag_uid: data.attributes.tag_uid,
        remain: data.attributes.remain,
        color: data.attributes.color,
        colorname: '',
        empty: data.attributes.empty,
        name: data.attributes.name
      };
    }
  } catch (error) {
    console.log(error);
  }

  return null;
};

export const getHassData = async () => {
  let sensors = process.env.HASS_SENSORS.split(',');
  let promises = [];

  for (let i = 0; i < sensors.length; i++) {
    for (let j = 1; j <= 4; j++) {
      promises.push(getAMSTrays(`${sensors[i]}_tray_${j}`));
    }
  }

  const trays = (await Promise.all(promises)).filter(e => e !== null);

  trays.forEach((tray) => {
    const tag_uid = tray.tag_uid;
    const key = tray.color + tray.type + tray.name + tray.manufacturer;

    if (!usagedata[tag_uid]) {
      let notTracked = Object.values(usagedata).find((tray) => {
        const localkey = tray.color + tray.type + tray.name + tray.manufacturer;

        if (localkey === key && !tray.tracking) {
          return true;
        }

        return false;
      });

      let colorname = Object.values(usagedata).find((tray) => {
        const localkey = tray.color + tray.type + tray.name + tray.manufacturer;

        if (localkey === key && tray.colorname) {
          return true;
        }

        return false;
      })?.colorname;

      if (notTracked) {
        delete usagedata[notTracked.tag_uid];
        notTracked.tag_uid = tag_uid;
        notTracked.tracking = true;
        notTracked.colorname = colorname;
        usagedata[tag_uid] = notTracked;
      } else {
        usagedata[tag_uid] = tray;
        usagedata[tag_uid].tracking = true;
        usagedata[tag_uid].colorname = colorname;
      }
    } else {
      usagedata[tag_uid].remain = tray.remain;
      usagedata[tag_uid].empty = tray.empty;
      usagedata[tag_uid].tracking = true;
    }

    if (usagedata[tag_uid].empty || (usagedata[tag_uid].remain <= 0 && usagedata[tag_uid].remain !== -1)) {
      delete usagedata[tag_uid];
    }
  });

  const hassDataJson = JSON.stringify(usagedata);

  await fs.writeFile('./data/hass-data.json', hassDataJson);
};

// Run once on startup
getHassData();

// Run every minute
setInterval(getHassData, 1000 * 60);

export default usagedata;
