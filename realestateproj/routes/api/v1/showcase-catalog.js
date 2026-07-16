var express = require("express");
var router = express.Router();
let responseBuilder = require("../../../utilities/response-builder");

const showcaseAndCatalog = {
    showcase: [
        {
            "project": "Greenfield Residency",
            "image": "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800",
            "place": "Kowdiar"
        },
        {
            "project": "Sreyas Luxury Villas",
            "image": "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800",
            "place": "Vattiyoorkavu"
        },
        {
            "project": "Nila Apartments Phase 1",
            "image": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
            "place": "Kazhakkoottam"
        },
        {
            "project": "Horizon Heights",
            "image": "https://images.unsplash.com/photo-1464082354059-27db6ce50048?w=800",
            "place": "Peroorkada"
        },
        {
            "project": "Palm Grove Enclave",
            "image": "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800",
            "place": "Thirumala"
        },
        {
            "project": "Aakash Premium Flats",
            "image": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
            "place": "Nemom"
        },
        {
            "project": "Silver Oaks Township",
            "image": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800",
            "place": "Ulloor"
        },
        {
            "project": "Maithri Garden Homes",
            "image": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
            "place": "Mannanthala"
        },
        {
            "project": "Coastline Condominiums",
            "image": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
            "place": "Veli"
        },
        {
            "project": "Royal Crest Residences",
            "image": "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800",
            "place": "Enchakkal"
        },
        {
            "project": "The Amber Terraces",
            "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
            "place": "Attingal"
        },
        {
            "project": "Kaveri Smart Homes",
            "image": "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800",
            "place": "Nedumangad"
        },
        {
            "project": "Meadowbrook Apartments",
            "image": "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800",
            "place": "Pothencode"
        },
        {
            "project": "Vande Nagar Phase 2",
            "image": "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800",
            "place": "Karamana"
        },
        {
            "project": "Sahyadri Hill View Villas",
            "image": "https://images.unsplash.com/photo-1472224371017-08207f84aaae?w=800",
            "place": "Aruvikkara"
        },
        {
            "project": "Lotus Pinnacle Towers",
            "image": "https://images.unsplash.com/photo-1494526585095-c41746248156?w=800",
            "place": "Pattom"
        },
        {
            "project": "Emerald Bay Residency",
            "image": "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800",
            "place": "Technopark"
        },
        {
            "project": "Santhigiri Smart Township",
            "image": "https://images.unsplash.com/photo-1448630360428-65456885c650?w=800",
            "place": "Pothanamthitta Road"
        },
        {
            "project": "Vrindavan Heritage Homes",
            "image": "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800",
            "place": "Varkala"
        },
        {
            "project": "BlueSky Executive Suites",
            "image": "https://images.unsplash.com/photo-1628744448840-55bdb2497bd4?w=800",
            "place": "Murukkumpuzha"
        },
        {
            "project": "Trinova Central Square",
            "image": "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=800",
            "place": "Kesavadasapuram"
        },
        {
            "project": "Sundaram Villa Cluster",
            "image": "https://images.unsplash.com/photo-1584738766473-61c083514bf4?w=800",
            "place": "Parassala"
        }
    ],
    catalog: [
        {
            "brand": "Somany Ceramic Floor Tile (per sq.ft)",
            "image": "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800",
            "price": "₹62"
        },
        {
            "brand": "RAK Porcelain Wall Tile (per sq.ft)",
            "image": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800",
            "price": "₹110"
        },
        {
            "brand": "Johnson Endura Anti-Skid Tile (per sq.ft)",
            "image": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",
            "price": "₹75"
        },
        {
            "brand": "CERA Wall-Hung Water Closet",
            "image": "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800",
            "price": "₹8,200"
        },
        {
            "brand": "Parryware EWC Toilet (Floor Mount)",
            "image": "https://images.unsplash.com/photo-1580100586938-02822d99c4a8?w=800",
            "price": "₹5,500"
        },
        {
            "brand": "Hindware Pedestal Wash Basin",
            "image": "https://images.unsplash.com/photo-1564540574859-0dfb63985953?w=800",
            "price": "₹3,800"
        },
        {
            "brand": "Jaquar Single Lever Basin Mixer",
            "image": "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800",
            "price": "₹4,200"
        },
        {
            "brand": "Kohler Undermount Kitchen Sink",
            "image": "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=800",
            "price": "₹12,500"
        },
        {
            "brand": "Finolex FR PVC Wire 1.5 sq.mm (90m coil)",
            "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
            "price": "₹1,150"
        },
        {
            "brand": "Havells Crabtree Modular Switch (6A)",
            "image": "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800",
            "price": "₹320"
        },
        {
            "brand": "Legrand MCB 32A Single Pole",
            "image": "https://images.unsplash.com/photo-1558002038-1055907df827?w=800",
            "price": "₹480"
        },
        {
            "brand": "Syska LED Panel Light 18W",
            "image": "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=800",
            "price": "₹750"
        },
        {
            "brand": "Nitco Designer Marble Tile (per sq.ft)",
            "image": "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800",
            "price": "₹145"
        },
        {
            "brand": "Varmora Wooden Finish Vitrified Tile (per sq.ft)",
            "image": "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800",
            "price": "₹92"
        },
        {
            "brand": "Orient Bell Digital Wall Tile (per sq.ft)",
            "image": "https://images.unsplash.com/photo-1600210491369-e753d80a41f3?w=800",
            "price": "₹68"
        },
        {
            "brand": "Schneider Electric Acti9 RCCB 40A",
            "image": "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800",
            "price": "₹1,850"
        }
    ]
}

router.get("/", (req, res) => {
    return responseBuilder.sendSuccessResponse(res, showcaseAndCatalog);
});

module.exports = router;
