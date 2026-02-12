import '../styles/About.css';

export function About() {
  return (
    <div className="about-page">
      <div className="about-container">
        <section className="about-section hero">
          <h1>Ubicanos</h1>
          <p>Tenemos Sede Principal y 4 Sucursales por Todo el Perú</p>
        </section>

        <section className="about-section location">
          <div className="location-info">
            <h2>Nuestra Ubicación</h2>
            <div className="info-box">
              <h3>Dirección</h3>
              <p>Calle Comercio #632 - MOLLENDO</p>
              <p>Jirón Abtao N° 665 - ILO</p>
              <p>Carlos Shutton Mz A 20 Lt 2 - PEDREGAL</p>
              <p>Av. Dean Valdivia N° 641 - COCACHACRA</p>
            </div>

            <div className="info-box">
              <h3>Horario de Atención</h3>
              <p>Lunes a Sábado: 9:00 AM - 8:30 PM</p>
            </div>

            <div className="info-box">
              <h3>Contacto</h3>
              <p>Teléfono: +51957833503</p>
              <p>Email: manzanaresenlinea@gmail.com</p>
              <p>WhatsApp: +51922027675</p>
            </div>
          </div>

          <div className="map-container">
            <iframe
              title="Mapa de Manzanares"
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d570.630457576494!2d-72.01558239018053!3d-17.025349618043634!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x914159c4c6444663%3A0x5126040feed1b825!2sTienda%20De%20Electrodomesticos%20Manzanares!5e1!3m2!1ses-419!2spe!4v1766527258386!5m2!1ses-419!2spe"             
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </section>

        <section className="about-section features">
          <h2>¿Por qué elegir Manzanares?</h2>
          <div className="features-grid">
            <div className="feature">
              <h3>🚚 Entrega Rápida</h3>
              <p>Entregamos en tu domicilio en 24 horas</p>
            </div>
            <div className="feature">
              <h3>💲Productos de Buena Calidad - Precio</h3>
              <p>Productos de Calidad para tu Hogar y/o Negocio</p>
            </div>
            <div className="feature">
              <h3>💯 Garantía Garantizada</h3>
              <p>Todos nuestros productos tienen garantía</p>
            </div>
            <div className="feature">
              <h3>👥 Atención al Cliente</h3>
              <p>Estamos aquí para ayudarte en todo momento</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
