import { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { FlatList, StyleSheet, Text, View } from "react-native";
import * as Permissions from "expo-permissions";
import * as MediaLibrary from "expo-media-library";
import { differenceInDays, format } from "date-fns";

export default function App() {
    const [audioFiles, setAudioFiles] = useState<MediaLibrary.Asset[]>([]);
    async function func() {
        const perm = await Permissions.askAsync(Permissions.MEDIA_LIBRARY);
        if (perm.status != "granted") {
            alert("Sorry, we need permissions to make this work!");
            return;
        }

        try {
            let media = await MediaLibrary.getAssetsAsync({
                mediaType: "audio",
            });
            console.log(media);

            media = await MediaLibrary.getAssetsAsync({
                mediaType: "audio",
                first: media.totalCount,
            });

            const audios = media.assets.filter((asset) =>
                asset.uri.includes("/Call/Call recording"),
            );

            const audioCreatedMoreThan30DaysAgo = audios.filter(
                (audio) =>
                    differenceInDays(new Date(), new Date(audio.creationTime)) >
                    30,
            );

            setAudioFiles(audioCreatedMoreThan30DaysAgo);
        } catch (e) {
            console.log("====================================");
            console.log(e);
            console.log("====================================");
        }
    }

    useEffect(() => {
        func();
    }, []);

    return (
        <View style={styles.container}>
            <FlatList
                data={audioFiles}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <Text>
                        {`${item.filename}\n\n${format(
                              new Date(item.creationTime),
                              "MMMM dd, uuuu",
                          )}(${differenceInDays(
                            new Date(),
                            new Date(item.creationTime),
                        )})\n\n\n`}
                    </Text>
                )}
            />
            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 50,
    },
});
